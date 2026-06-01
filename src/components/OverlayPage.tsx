import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbService } from '../lib/supabase';
import { Game, Player } from '../types';
import { Trophy, Medal, AlertCircle, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OverlayPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransparent, setIsTransparent] = useState(true);
  const [showUiControls, setShowUiControls] = useState(true);

  useEffect(() => {
    if (!gameId) {
      setError('Lobby session ID is missing');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const fetchedGame = await dbService.games.fetchById(gameId);
        if (!fetchedGame) {
          setError('Live game session not found or deleted');
          setLoading(false);
          return;
        }
        setGame(fetchedGame);

        const fetchedPlayers = await dbService.players.fetchAllForGame(gameId);
        setPlayers(fetchedPlayers);
      } catch (err: any) {
        setError(err.message || 'Error occurred loading scores');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Setup active real-time channel subscription to synchronize ranks
    const unsubscribe = dbService.players.subscribeToLeaderboard(gameId, async () => {
      try {
        const updated = await dbService.players.fetchAllForGame(gameId);
        setPlayers(updated);
      } catch (err) {
        console.warn('Realtime sync skipped:', err);
      }
    });

    // Auto hide standard hover controls after 4 seconds to maintain clean OBS overlays
    const timer = setTimeout(() => {
      setShowUiControls(false);
    }, 4000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timer);
    };
  }, [gameId]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white gap-3 font-sans select-none">
        <div className="animate-spin text-rose-500 w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-sm font-bold tracking-widest text-rose-500 uppercase">SYNCHRONIZING SCORECARD...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center font-sans space-y-4">
        <AlertCircle size={40} className="text-rose-500" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold">OBS Link Error</h3>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{error || 'Unable to connect to live game feeds'}</p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold transition-all hover:bg-rose-600 shadow-lg shadow-rose-500/20"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const topPlayers = players.slice(0, 3);
  const remainingPlayers = players.slice(3, 8); // Display top 8 in detailed leaderboards on web overlay

  return (
    <div 
      className={`fixed inset-0 font-sans select-none overflow-hidden duration-300 ${
        isTransparent 
          ? 'bg-transparent text-white' 
          : 'bg-[#0b101d] text-white p-8 border-4 border-slate-900/60'
      }`}
      onMouseMove={() => setShowUiControls(true)}
    >
      
      {/* FLOAT BAR FOR SETUP - Only visible on direct setup tabs or mouse movement */}
      <AnimatePresence>
        {showUiControls && (
          <motion.div
            id="obs-setup-bar"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-4 left-4 right-4 z-50 bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center justify-between border border-slate-800 text-xs shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={12} />
                <span>Exit Preview</span>
              </Link>
              <div className="h-4 w-px bg-slate-800" />
              <div>
                <span className="text-[9px] uppercase font-mono font-bold text-rose-500 block">GAME LOBBY FEED</span>
                <span className="font-extrabold text-white truncate max-w-[140px] block">{game.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="obs-toggle-bg"
                onClick={() => setIsTransparent(!isTransparent)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold flex items-center gap-1 transition-colors"
                type="button"
              >
                {isTransparent ? <EyeOff size={11} className="text-yellow-500" /> : <Eye size={11} className="text-cyan-400" />}
                <span>{isTransparent ? 'Chroma On (Transparent)' : 'Dark Stage On'}</span>
              </button>
              
              <button
                id="obs-hide-controls"
                onClick={() => setShowUiControls(false)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] transition-colors"
                type="button"
              >
                Hide Preset Control Bar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY PRIMARY CONTENT CONTAINER */}
      <div className="h-full flex flex-col justify-center items-center px-6 max-w-lg mx-auto py-12">
        
        {/* GAME TYPE FLICK DECK */}
        <div className="text-center mb-8 space-y-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-rose-500 bg-rose-500/15 px-3 py-1 rounded-full border border-rose-500/30 inline-block">
            {game.game_type}
          </span>
          <h2 className="text-base font-extrabold tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter">
            {game.title} Leaderboard
          </h2>
        </div>

        {/* PODIUM TOP 3 GRAPHICS */}
        {topPlayers.length === 0 ? (
          <div className="text-center py-10 space-y-1 bg-black/40 backdrop-blur-md px-8 py-6 rounded-[2rem] border border-slate-800 shadow-2xl">
            <Trophy size={36} className="text-slate-500 mx-auto animate-bounce mb-2" />
            <p className="text-sm font-bold tracking-wider text-slate-300">WAITING FOR STREAM GAME WINNERS...</p>
            <p className="text-[10px] text-slate-500">Winners will slide in instantly once added from the host device.</p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            
            {/* STAGGERED TOP 3 GRID */}
            <div className="grid grid-cols-1 gap-3">
              {topPlayers.map((player, index) => {
                const rank = index + 1;
                // Determine styling based on rank
                const colorClass = 
                  rank === 1 ? 'border-amber-400 bg-amber-500/20 text-yellow-300 shadow-yellow-500/10' :
                  rank === 2 ? 'border-slate-300 bg-slate-300/10 text-slate-100 shadow-slate-100/5' :
                  'border-amber-700 bg-amber-700/10 text-amber-500 shadow-amber-800/5';

                const icon = 
                  rank === 1 ? <Trophy className="text-amber-400" size={24} /> :
                  rank === 2 ? <Medal className="text-slate-300" size={20} /> :
                  <Medal className="text-amber-700" size={18} />;

                return (
                  <motion.div
                    id={`obs-winner-rank-${player.id}`}
                    key={player.id}
                    layoutId={`podium-card-${player.id}`}
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    className={`flex items-center justify-between p-4 px-5 rounded-2xl border backdrop-blur-md shadow-lg ${colorClass}`}
                  >
                    <div className="flex items-center gap-4.5 min-w-0">
                      
                      {/* Rank container */}
                      <div className="flex items-center justify-center shrink-0">
                        {icon}
                      </div>

                      {/* Username */}
                      <div className="min-w-0">
                        <span className="text-base font-extrabold tracking-wide block truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                          @{player.username}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest mt-0.5">
                          {rank === 1 ? '1ST CHAMPION' : rank === 2 ? '2ND PLACE' : '3RD PLACE'}
                        </span>
                      </div>
                    </div>

                    {/* Scores wins count with beautiful font metrics */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black font-mono tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                        {player.wins}
                      </span>
                      <span className="text-[10px] font-bold text-rose-500">WINS</span>
                    </div>

                  </motion.div>
                );
              })}
            </div>

            {/* REMAINING HONORABLE MENTIONS RANKINGS (4th to 8th) */}
            {remainingPlayers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Honorable Mentions</p>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto no-scrollbar">
                  {remainingPlayers.map((player, index) => {
                    const actualRank = index + 4;
                    return (
                      <div
                        id={`obs-honorable-${player.id}`}
                        key={player.id}
                        className="bg-black/30 backdrop-blur-sm border border-slate-800/40 rounded-xl p-2 px-4 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] font-bold text-slate-500">#{actualRank}</span>
                          <span className="font-bold">@{player.username}</span>
                        </div>
                        <span className="font-mono font-extrabold text-slate-300">{player.wins} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
