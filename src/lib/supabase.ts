import { createClient } from '@supabase/supabase-js';
import { Game, Player, Profile, ActivityLog } from '../types';
import { DEV_MODE } from '../config/env';

// Read configuration from environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Determine if we are utilizing the real Supabase server
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl.includes('supabase.co') && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 50; // Anon keys are typically very long strings

// Initialize real Supabase client client-side on access
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- DUAL-MODE SERVICE REPOSITORY ---
// To maintain single client implementation throughout the components, 
// we expose a unified service layer for Game and Score Tracking.

// Simple local listener store for real-time sandbox updates
const sandboxListeners: Set<() => void> = new Set();
export const subscribeToSandbox = (callback: () => void) => {
  sandboxListeners.add(callback);
  return () => {
    sandboxListeners.delete(callback);
  };
};

const notifySandboxListeners = () => {
  sandboxListeners.forEach(cb => cb());
};

// Initial local storage setup helpers
const getLocalStorage = <T>(key: string, initialValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return initialValue;
  try {
    return JSON.parse(data) as T;
  } catch {
    return initialValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
  notifySandboxListeners();
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

export function generateUniqueUsername(email: string): string {
  let username = email.split('@')[0].toLowerCase();
  username = username.replace(/[^a-z0-9_]/g, '');
  if (!username) username = 'user';
  return username;
}

export async function getOrCreateProfile(user: { id: string; email?: string; user_metadata?: Record<string, any> }): Promise<Profile | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfile) {
    const hasProperUsername = existingProfile.username && !existingProfile.username.startsWith('User_');
    if (hasProperUsername) {
      return existingProfile as Profile;
    }
  }

  const email = user.email || '';
  let baseUsername = generateUniqueUsername(email);
  let username = baseUsername;
  let counter = 1;

  while (true) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (!existing) break;
    username = `${baseUsername}${counter}`;
    counter++;
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';

  if (existingProfile) {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ username, avatar_url: avatarUrl, full_name: fullName })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return updated as Profile;
  }

  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({ id: user.id, username, avatar_url: avatarUrl, full_name: fullName })
    .select()
    .single();
  if (error) throw error;
  return newProfile as Profile;
}

export const dbService = {
  // Auth Operations
  auth: {
    async signUp(email: string, password: string, username: string) {
      if (isSupabaseConfigured && supabase) {
        // Sign up user via real Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
            }
          }
        });

        if (error) throw error;
        
        // Profiles may be inserted via a trigger, but to guarantee reliability,
        // we write the profile insert manually. We use upsert to avoid issues with triggers.
        if (data.user) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                username,
                avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
              });
            if (profileError) {
              console.warn('Profile sync notice:', profileError.message);
              // Handle RLS error specifically - if it fails here, the user is still authenticated
              // and the trigger might have already created the profile
            }
          } catch (e: any) {
            console.warn('Profile sync exception:', e.message);
          }
        }

        return data;
      } else {
        // Sandbox Mock Auth Sign Up
        const users = getLocalStorage<any[]>('sb_auth_users', []);
        if (users.some(u => u.email === email)) {
          throw new Error('Email already registered.');
        }

        const userId = generateId();
        const newUser = { id: userId, email, password, username };
        users.push(newUser);
        setLocalStorage('sb_auth_users', users);

        // Create initial Profile
        const profiles = getLocalStorage<Profile[]>('sb_profiles', []);
        const newProfile: Profile = {
          id: userId,
          username,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
          created_at: new Date().toISOString()
        };
        profiles.push(newProfile);
        setLocalStorage('sb_profiles', profiles);

        // Auto login after sign up in sandbox
        const session = { user: { id: userId, email, username, avatar_url: newProfile.avatar_url } };
        setLocalStorage('sb_session', session);

        return { user: session.user };
      }
    },

    async signInWithGoogleToken(idToken: string) {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (error) throw error;

        if (data.user) {
          try {
            const profile = await getOrCreateProfile({
              id: data.user.id,
              email: data.user.email || undefined,
              user_metadata: data.user.user_metadata,
            });
            return { ...data, profile };
          } catch (e: any) {
            console.warn('Profile auto-creation warning:', e.message);
          }
        }

        return data;
      } else {
        throw new Error('Google Sign In is not available in sandbox mode.');
      }
    },

    async signInWithGoogle() {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: true,
            redirectTo: `${window.location.origin}/?popup=true`
          }
        });
        if (error) throw error;
        
        if (data?.url) {
          const w = 500;
          const h = 600;
          const left = (window.screen.width / 2) - (w / 2);
          const top = (window.screen.height / 2) - (h / 2);
          
          const popup = window.open(
            data.url,
            'supabase-oauth',
            `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`
          );
          return popup;
        }
        return null;
      } else {
        throw new Error('Google Sign In is not available in sandbox mode. Please connect Supabase.');
      }
    },

    async signIn(email: string, password: string) {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        // Fetch matching profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            username: profile?.username || data.user.user_metadata?.username || 'Live Host',
            avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.user.id}`,
            full_name: profile?.full_name || data.user.user_metadata?.full_name || '',
          }
        };
      } else {
        // Sandbox authentication
        const users = getLocalStorage<any[]>('sb_auth_users', []);
        const matched = users.find(u => u.email === email && u.password === password);
        if (!matched) {
          throw new Error('Invalid email or password.');
        }

        const profiles = getLocalStorage<Profile[]>('sb_profiles', []);
        const profile = profiles.find(p => p.id === matched.id) || {
          id: matched.id,
          username: matched.username,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(matched.username)}`
        };

        const session = { user: { id: matched.id, email: matched.email, username: profile.username, avatar_url: profile.avatar_url } };
        setLocalStorage('sb_session', session);

        return session;
      }
    },

    async signOut() {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem('sb_session');
        notifySandboxListeners();
      }
    },

    async getCurrentUser() {
      if (isSupabaseConfigured && supabase) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) return null;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        return {
          id: session.user.id,
          email: session.user.email || '',
          username: profile?.username || session.user.user_metadata?.username || 'Live Host',
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${session.user.id}`,
          full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
        };
      } else {
        const session = getLocalStorage<any>('sb_session', null);
        if (!session) return null;
        return session.user;
      }
    },

    async updateProfile(userId: string, username: string, avatarUrl: string, fullName?: string) {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            username,
            avatar_url: avatarUrl,
            full_name: fullName || null,
          });
        if (error) throw error;
      } else {
        const profiles = getLocalStorage<Profile[]>('sb_profiles', []);
        const idx = profiles.findIndex(p => p.id === userId);
        if (idx !== -1) {
          profiles[idx].username = username;
          profiles[idx].avatar_url = avatarUrl;
          if (fullName !== undefined) profiles[idx].full_name = fullName;
        } else {
          profiles.push({ id: userId, username, avatar_url: avatarUrl, full_name: fullName });
        }
        setLocalStorage('sb_profiles', profiles);

        // Update local session info
        const session = getLocalStorage<any>('sb_session', null);
        if (session && session.user.id === userId) {
          session.user.username = username;
          session.user.avatar_url = avatarUrl;
          if (fullName !== undefined) session.user.full_name = fullName;
          setLocalStorage('sb_session', session);
        }
      }
    },

    async updateUserCredentials(userId: string, newEmail?: string, newPassword?: string) {
      if (isSupabaseConfigured && supabase) {
        let updates: { email?: string; password?: string } = {};
        if (newEmail) updates.email = newEmail;
        if (newPassword) updates.password = newPassword;
        if (Object.keys(updates).length > 0) {
          const { error } = await supabase.auth.updateUser(updates);
          if (error) throw error;
        }
      } else {
        // Sandbox update
        const users = getLocalStorage<any[]>('sb_auth_users', []);
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
          if (newEmail) users[idx].email = newEmail;
          if (newPassword) users[idx].password = newPassword;
          setLocalStorage('sb_auth_users', users);
        }

        const session = getLocalStorage<any>('sb_session', null);
        if (session && session.user.id === userId) {
          if (newEmail) session.user.email = newEmail;
          setLocalStorage('sb_session', session);
        }
      }
    }
  },

  // Game Operations
  games: {
    async fetchAll(userId: string): Promise<Game[]> {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Game[];
      } else {
        const games = getLocalStorage<Game[]>('sb_games', []);
        return games
          .filter(game => game.user_id === userId)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    },

    async fetchById(gameId: string): Promise<Game | null> {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();
        
        if (error) return null;
        return data as Game;
      } else {
        const games = getLocalStorage<Game[]>('sb_games', []);
        return games.find(g => g.id === gameId) || null;
      }
    },

    async create(userId: string, title: string, gameType: string): Promise<Game> {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('games')
          .insert({
            user_id: userId,
            title,
            game_type: gameType,
          })
          .select()
          .single();

        if (error) throw error;
        return data as Game;
      } else {
        const games = getLocalStorage<Game[]>('sb_games', []);
        const newGame: Game = {
          id: generateId(),
          user_id: userId,
          title,
          game_type: gameType,
          created_at: new Date().toISOString()
        };
        games.push(newGame);
        setLocalStorage('sb_games', games);
        return newGame;
      }
    },

    async delete(gameId: string): Promise<void> {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', gameId);
        if (error) throw error;
      } else {
        const games = getLocalStorage<Game[]>('sb_games', []);
        const players = getLocalStorage<Player[]>('sb_players', []);
        
        const filteredGames = games.filter(g => g.id !== gameId);
        const filteredPlayers = players.filter(p => p.game_id !== gameId);
        
        setLocalStorage('sb_games', filteredGames);
        setLocalStorage('sb_players', filteredPlayers);
      }
    }
  },

  // Player & Winner Operations
  players: {
    async fetchAllForGame(gameId: string): Promise<Player[]> {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameId)
          .order('wins', { ascending: false });

        if (error) throw error;
        return data as Player[];
      } else {
        const players = getLocalStorage<Player[]>('sb_players', []);
        return players
          .filter(p => p.game_id === gameId)
          .sort((a, b) => b.wins - a.wins);
      }
    },

    async addWinner(gameId: string, usernameRaw: string, winAmount: number): Promise<Player> {
      const username = usernameRaw.trim().replace(/^@/, ''); // automatically remove leading @ prefix
      
      if (isSupabaseConfigured && supabase) {
        // Query to see if player already exists in this game
        const { data: existing, error: queryError } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameId)
          .eq('username', username);

        if (queryError) throw queryError;

        if (existing && existing.length > 0) {
          const playerToUpdate = existing[0];
          const newWins = playerToUpdate.wins + winAmount;

          const { data, error } = await supabase
            .from('players')
            .update({ wins: newWins })
            .eq('id', playerToUpdate.id)
            .select()
            .single();

          if (error) throw error;
          return data as Player;
        } else {
          // Add new player to current game
          const { data, error } = await supabase
            .from('players')
            .insert({
              game_id: gameId,
              username,
              wins: winAmount,
            })
            .select()
            .single();

          if (error) throw error;
          return data as Player;
        }
      } else {
        const players = getLocalStorage<Player[]>('sb_players', []);
        const matchedIndex = players.findIndex(p => p.game_id === gameId && p.username.toLowerCase() === username.toLowerCase());

        if (matchedIndex !== -1) {
          players[matchedIndex].wins += winAmount;
          const updated = players[matchedIndex];
          setLocalStorage('sb_players', players);
          return updated;
        } else {
          const newPlayer: Player = {
            id: generateId(),
            game_id: gameId,
            username,
            wins: winAmount,
            created_at: new Date().toISOString()
          };
          players.push(newPlayer);
          setLocalStorage('sb_players', players);
          return newPlayer;
        }
      }
    },

    async updateWins(playerId: string, wins: number): Promise<void> {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('players')
          .update({ wins })
          .eq('id', playerId);
        if (error) throw error;
      } else {
        const players = getLocalStorage<Player[]>('sb_players', []);
        const idx = players.findIndex(p => p.id === playerId);
        if (idx !== -1) {
          players[idx].wins = wins;
          setLocalStorage('sb_players', players);
        }
      }
    },

    async deletePlayer(playerId: string): Promise<void> {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', playerId);
        if (error) throw error;
      } else {
        const players = getLocalStorage<Player[]>('sb_players', []);
        const filtered = players.filter(p => p.id !== playerId);
        setLocalStorage('sb_players', filtered);
      }
    },

    async resetLeaderboard(gameId: string): Promise<void> {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('game_id', gameId);
        if (error) throw error;
      } else {
        const players = getLocalStorage<Player[]>('sb_players', []);
        const filtered = players.filter(p => p.game_id !== gameId);
        setLocalStorage('sb_players', filtered);
      }
    },

    // Set up a real-time subscription for the current game leaderboard
    subscribeToLeaderboard(gameId: string, onUpdate: () => void) {
      if (isSupabaseConfigured && supabase) {
        const subscription = supabase
          .channel(`leaderboard:${gameId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'players',
              filter: `game_id=eq.${gameId}`
            },
            () => {
              onUpdate();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      } else {
        return subscribeToSandbox(onUpdate);
      }
    }
  },

  // Activity Log Operations
  activityLogs: {
    async fetchAll(userId: string): Promise<ActivityLog[]> {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Failed to fetch activity logs from Supabase:', error.message);
          return [];
        }
        return data as ActivityLog[];
      } else {
        const logs = getLocalStorage<ActivityLog[]>('sb_activity_logs', []);
        return logs
          .filter(log => log.user_id === userId)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    },

    async create(
      userId: string,
      type: 'wins' | 'game_created' | 'score_updated' | 'system',
      title: string,
      metadata?: any
    ): Promise<ActivityLog> {
      const newLogPayload = {
        user_id: userId,
        type,
        title,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('activity_logs')
            .insert(newLogPayload)
            .select()
            .single();

          if (error) {
            console.warn('Inserted log failed but continuing under sandbox profile:', error.message);
          } else {
            return data as ActivityLog;
          }
        } catch (e: any) {
          console.warn('Realtime Activity Log exception:', e.message);
        }
      }

      // Safe Local storage fallback (Dev-Mode/Sandbox or missing table fallback)
      const logs = getLocalStorage<ActivityLog[]>('sb_activity_logs', []);
      const newLogLocal: ActivityLog = {
        id: generateId(),
        ...newLogPayload
      };
      logs.push(newLogLocal);
      // Keep lists from growing infinite
      if (logs.length > 100) {
        logs.shift(); // remove oldest
      }
      setLocalStorage('sb_activity_logs', logs);
      return newLogLocal;
    },

    subscribeToActivity(userId: string, onUpdate: () => void) {
      if (isSupabaseConfigured && supabase) {
        const subscription = supabase
          .channel(`activity_logs:${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'activity_logs',
              filter: `user_id=eq.${userId}`
            },
            () => {
              onUpdate();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      } else {
        return subscribeToSandbox(onUpdate);
      }
    }
  }
};
