export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  created_at?: string;
}

export interface Game {
  id: string;
  user_id: string;
  title: string;
  game_type: string;
  created_at: string;
}

export interface Player {
  id: string;
  game_id: string;
  username: string;
  wins: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  type: 'wins' | 'game_created' | 'score_updated' | 'system';
  title: string;
  metadata?: {
    game_id?: string;
    game_title?: string;
    player_id?: string;
    player_name?: string;
    wins?: number;
    difference?: number;
    [key: string]: any;
  };
  created_at: string;
}

export type GameType = 
  | 'Odd One Out' 
  | 'Word Guess' 
  | 'Quiz' 
  | 'Lucky Draw' 
  | 'Number Hunt' 
  | 'Custom';

export interface AppState {
  theme: 'light' | 'dark';
  user: {
    id: string;
    email: string;
    username: string;
    avatar_url: string;
  } | null;
  loading: boolean;
}
