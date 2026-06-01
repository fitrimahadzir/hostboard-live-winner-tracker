import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService, isSupabaseConfigured } from '../lib/supabase';
import { Game, Player, Profile } from '../types';
import { DEV_MODE } from '../config/env';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: any | null;
  loading: boolean;
  games: Game[];
  currentTournament: Game | null;
  players: Player[];
  theme: 'light' | 'dark';
  toasts: Toast[];
  isSupabaseConnected: boolean;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  toggleTheme: () => void;
  signUp: (email: string, username: string, pass: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogleToken: (token: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (username: string, avatarUrl: string) => Promise<void>;
  updateUserCredentials: (newEmail?: string, newPassword?: string) => Promise<void>;
  refreshGames: () => Promise<void>;
  createGame: (title: string, gameType: string) => Promise<Game>;
  deleteGame: (gameId: string) => Promise<void>;
  fetchGameDetail: (gameId: string) => Promise<Game | null>;
  fetchPlayers: (gameId: string) => Promise<Player[]>;
  addGameWinner: (gameId: string, username: string, winAmount: number) => Promise<void>;
  updatePlayerScore: (playerId: string, wins: number) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  resetLeaderboard: (gameId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  enterDevMode: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [games, setGames] = useState<Game[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize theme from storage
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  // Fetch session on load
  useEffect(() => {
    let authListener: any = null;

    const initSession = async () => {
      try {
        if (DEV_MODE) {
          const hasDevSession = localStorage.getItem('dev_mode_session') === 'true';
          if (hasDevSession) {
            const devUser = {
              id: 'dev-user',
              email: 'dev@local',
              username: 'Dev User',
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=dev-user`
            };
            setUser(devUser);
            const fetchedGames = await dbService.games.fetchAll('dev-user');
            setGames(fetchedGames);
          } else {
            setUser(null);
          }
        } else {
          const u = await dbService.auth.getCurrentUser();
          setUser(u);
          if (u) {
            const fetchedGames = await dbService.games.fetchAll(u.id);
            setGames(fetchedGames);
          }
          
          import('../lib/supabase').then(({ supabase, isSupabaseConfigured, getOrCreateProfile }) => {
            if (isSupabaseConfigured && supabase) {
              const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                  
                  if (window.opener && window.location.search.includes('popup=true')) {
                    window.close();
                    return;
                  }

                  if (session?.user) {
                    try {
                      await getOrCreateProfile({
                        id: session.user.id,
                        email: session.user.email || undefined,
                        user_metadata: session.user.user_metadata,
                      });
                    } catch (e: any) {
                      console.warn('Profile auto-creation on auth event:', e.message);
                    }
                  }

                  const u = await dbService.auth.getCurrentUser();
                  setUser(u);
                  if (u) {
                    const fetchedGames = await dbService.games.fetchAll(u.id);
                    setGames(fetchedGames);
                  }
                } else if (event === 'SIGNED_OUT') {
                  setUser(null);
                  setGames([]);
                  setCurrentTournament(null);
                  setPlayers([]);
                }
              });
              authListener = subscription;
            }
          });
        }
      } catch (err: any) {
        console.error('Session init error:', err);
      } finally {
        setLoading(false);
      }
    };
    initSession();

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    // Disabled: forced dark mode everywhere
  };

  const signUp = async (email: string, username: string, pass: string) => {
    setLoading(true);
    try {
      const res = await dbService.auth.signUp(email, pass, username);
      setUser(res.user);
      addToast('Account created successfully!', 'success');
      if (res.user) {
        const fetchedGames = await dbService.games.fetchAll(res.user.id);
        setGames(fetchedGames);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to sign up', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await dbService.auth.signIn(email, pass);
      setUser(res.user);
      addToast(`Welcome back, ${res.user.username}!`, 'success');
      const fetchedGames = await dbService.games.fetchAll(res.user.id);
      setGames(fetchedGames);
    } catch (err: any) {
      addToast(err.message || 'Failed to sign in', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleToken = async (idToken: string) => {
    try {
      if (DEV_MODE) {
        setLoading(true);
        addToast('Google login is bypassed in Dev Mode.', 'info');
        await enterDevMode();
        setLoading(false);
      } else {
        await dbService.auth.signInWithGoogleToken(idToken);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to authenticate Google token', 'error');
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (DEV_MODE) {
        setLoading(true);
        addToast('Google login is bypassed in Dev Mode.', 'info');
        await enterDevMode();
        setLoading(false);
      } else {
        await dbService.auth.signInWithGoogle();
        // Popup opens, onAuthStateChange listener will handle closing and session set
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to initialize Google login', 'error');
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (DEV_MODE) {
        localStorage.removeItem('dev_mode_session');
      } else {
        await dbService.auth.signOut();
      }
      setUser(null);
      setGames([]);
      setCurrentTournament(null);
      setPlayers([]);
      addToast('Logged out successfully', 'info');
    } catch (err: any) {
      addToast('Logout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (username: string, avatarUrl: string) => {
    if (!user) return;
    try {
      await dbService.auth.updateProfile(user.id, username, avatarUrl);
      setUser({ ...user, username, avatar_url: avatarUrl });
      addToast('Profile updated', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
      throw err;
    }
  };

  const updateUserCredentials = async (newEmail?: string, newPassword?: string) => {
    if (!user) return;
    try {
      await dbService.auth.updateUserCredentials(user.id, newEmail, newPassword);
      if (newEmail) {
        setUser({ ...user, email: newEmail });
      }
      addToast('Credentials updated successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update credentials', 'error');
      throw err;
    }
  };

  const enterDevMode = async () => {
    setLoading(true);
    try {
      const devUser = {
        id: 'dev-user',
        email: 'dev@local',
        username: 'Dev User',
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=dev-user`
      };
      localStorage.setItem('dev_mode_session', 'true');
      setUser(devUser);
      addToast('Entered Dev Mode successfully!', 'success');
      const fetchedGames = await dbService.games.fetchAll('dev-user');
      setGames(fetchedGames);
    } catch (err) {
      addToast('Failed to enter Dev Mode', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshGames = async () => {
    if (!user) return;
    try {
      const fetchedGames = await dbService.games.fetchAll(user.id);
      setGames(fetchedGames);
    } catch (err: any) {
      console.error(err);
    }
  };

  const createGame = async (title: string, gameType: string): Promise<Game> => {
    if (!user) throw new Error('Not authenticated');
    try {
      const newGame = await dbService.games.create(user.id, title, gameType);
      setGames((prev) => [newGame, ...prev]);
      
      // Auto log event
      await dbService.activityLogs.create(user.id, 'game_created', `New game "${title}" was started`, {
        game_id: newGame.id,
        game_title: title,
        game_type: gameType
      });

      addToast(`Game "${title}" started!`, 'success');
      return newGame;
    } catch (err: any) {
      addToast(err.message || 'Failed to start game', 'error');
      throw err;
    }
  };

  const deleteGame = async (gameId: string) => {
    try {
      await dbService.games.delete(gameId);
      setGames((prev) => prev.filter((g) => g.id !== gameId));
      if (currentTournament?.id === gameId) {
        setCurrentTournament(null);
        setPlayers([]);
      }
      addToast('Game deleted successfully', 'success');
    } catch (err: any) {
      addToast('Failed to delete game', 'error');
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const u = await dbService.auth.getCurrentUser();
    if (u) {
      setUser(u);
    }
  };

  const fetchGameDetail = async (gameId: string): Promise<Game | null> => {
    try {
      const game = await dbService.games.fetchById(gameId);
      if (game) {
        setCurrentTournament(game);
        return game;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const fetchPlayers = async (gameId: string): Promise<Player[]> => {
    try {
      const p = await dbService.players.fetchAllForGame(gameId);
      setPlayers(p);
      return p;
    } catch (err) {
      return [];
    }
  };

  const addGameWinner = async (gameId: string, winUserName: string, winAmount: number) => {
    try {
      const updatedPlayer = await dbService.players.addWinner(gameId, winUserName, winAmount);
      // Refresh local player list state
      const updatedList = await dbService.players.fetchAllForGame(gameId);
      setPlayers(updatedList);

      // Auto log event
      if (user) {
        await dbService.activityLogs.create(user.id, 'wins', `@${updatedPlayer.username} scored +${winAmount} wins!`, {
          game_id: gameId,
          game_title: currentTournament?.title || 'Active Game',
          player_name: updatedPlayer.username,
          wins: updatedPlayer.wins
        });
      }

      addToast(`+${winAmount} wins added to @${updatedPlayer.username}`, 'success');
    } catch (err: any) {
      addToast('Failed to update winner', 'error');
    }
  };

  const updatePlayerScore = async (playerId: string, wins: number) => {
    try {
      const player = players.find(p => p.id === playerId);
      await dbService.players.updateWins(playerId, wins);
      if (currentTournament) {
        const updatedList = await dbService.players.fetchAllForGame(currentTournament.id);
        setPlayers(updatedList);
      }

      // Auto log event
      if (user && player) {
        await dbService.activityLogs.create(user.id, 'score_updated', `Adjusted @${player.username}'s score to ${wins} wins`, {
          game_id: currentTournament?.id || '',
          game_title: currentTournament?.title || 'Active Game',
          player_name: player.username,
          wins: wins
        });
      }

      addToast('Player score updated', 'success');
    } catch (err) {
      addToast('Failed to update player', 'error');
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      await dbService.players.deletePlayer(playerId);
      if (currentTournament) {
        const updatedList = await dbService.players.fetchAllForGame(currentTournament.id);
        setPlayers(updatedList);
      }
      addToast('Player deleted', 'success');
    } catch (err) {
      addToast('Failed to delete player', 'error');
    }
  };

  const resetLeaderboard = async (gameId: string) => {
    try {
      await dbService.players.resetLeaderboard(gameId);
      setPlayers([]);
      addToast('Leaderboard reset successfully', 'info');
    } catch (err) {
      addToast('Failed to reset leaderboard', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        games,
        currentTournament,
        players,
        theme,
        toasts,
        isSupabaseConnected: isSupabaseConfigured,
        addToast,
        removeToast,
        toggleTheme,
        signUp,
        signIn,
        signInWithGoogleToken,
        signInWithGoogle,
        signOut,
        updateUserProfile,
        updateUserCredentials,
        refreshGames,
        createGame,
        deleteGame,
        fetchGameDetail,
        fetchPlayers,
        addGameWinner,
        updatePlayerScore,
        deletePlayer,
        resetLeaderboard,
        refreshProfile,
        enterDevMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
