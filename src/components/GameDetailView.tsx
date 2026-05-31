import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Player } from '../types';
import { dbService } from '../lib/supabase';
import { 
  ArrowLeft, Users, Trophy, Trash2, RefreshCw, Plus, Search, 
  Copy, ExternalLink, Settings2, Edit3, Save, Minus, ShieldAlert,
  HelpCircle, MonitorPlay, AlertTriangle, Medal
} from 'lucide-react';
import { WinnerModal } from './WinnerModal';

interface GameDetailViewProps {
  gameId: string;
  onBack: () => void;
}

export const GameDetailView: React.FC<GameDetailViewProps> = ({
  gameId,
  onBack,
}) => {
  const { 
    fetchGameDetail, fetchPlayers, currentTournament, players,
    addGameWinner, updatePlayerScore, deletePlayer, resetLeaderboard, addToast
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddWinnerOpen, setIsAddWinnerOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load and subscribe to updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadData = async () => {
      setLoading(true);
      await fetchGameDetail(gameId);
      await fetchPlayers(gameId);
      setLoading(false);

      // Setup real-time postgres changes subscription or mock synchronization state
      unsubscribe = dbService.players.subscribeToLeaderboard(gameId, async () => {
        await fetchPlayers(gameId);
      });
    };

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [gameId]);

  // Compute stats
  const totalPlayers = players.length;
  const totalWinsAllocated = players.reduce((sum, p) => sum + p.wins, 0);

  // Filter players
  const filteredPlayers = players.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyOverlayUrl = () => {
    const origin = window.location.origin;
    // Construct real path link
    const path = `${origin}#/overlay/${gameId}`;
    navigator.clipboard.writeText(path);
    setCopied(true);
    addToast('OBS Overlay URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const startEditing = (p: Player) => {
    setEditingPlayerId(p.id);
    setEditingScore(p.wins);
  };

  const handleSaveScore = async (playerId: string) => {
    if (editingScore < 0) return;
    await updatePlayerScore(playerId, editingScore);
    setEditingPlayerId(null);
  };

  const handleQuickAdjust = async (p: Player, delta: number) => {
    const finalWins = p.wins + delta;
    if (finalWins < 0) {
      await deletePlayer(p.id);
    } else {
      await updatePlayerScore(p.id, finalWins);
    }
  };

  const handleConfirmReset = async () => {
    await resetLeaderboard(gameId);
    setShowResetConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin text-rose-500 w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-xs font-semibold text-slate-400">Loading live lobby...</p>
      </div>
    );
  }

  if (!currentTournament) {
    return (
      <div className="text-center py-10 px-4">
        <AlertTriangle className="text-rose-500 mx-auto w-12 h-12 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Lobby not found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This game may have been deleted or doesn't belong to your profile.</p>
        <button
          id="not-found-back-btn"
          onClick={onBack}
          className="mt-4 px-5 py-2.5 bg-rose-500 text-white rounded-2xl text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const overlayHref = `#/overlay/${gameId}`;

  return (
    <div className="space-y-6 pb-32 md:pb-12 text-left select-none relative">
      
      {/* DIRECT NAVIGATION HEADER */}
      <div className="flex items-center justify-between">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer text-slate-600 dark:text-slate-400 focus:outline-none"
        >
          <ArrowLeft size={18} />
        </button>

        <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400">
          LOBBY CONSOLE
        </span>

        <button
          id="lobby-reset-trigger"
          onClick={() => setShowResetConfirm(true)}
          className="p-2 -mr-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition-colors focus:outline-none"
          title="Reset Dashboard"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* STICKY CARD OVERVIEW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/30 px-2.5 py-0.5 rounded-full inline-block">
              {currentTournament.game_type}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
              {currentTournament.title}
            </h2>
          </div>
        </div>

        {/* STATS MATRIX SECTION */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100/60 dark:border-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 shrink-0">
              <Users size={14} />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Players</p>
              <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">{totalPlayers}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 border-l border-slate-200/50 dark:border-slate-800/50 pl-3">
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-500 shrink-0">
              <Trophy size={14} />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Total Scores</p>
              <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">{totalWinsAllocated}</p>
            </div>
          </div>
        </div>

        {/* OBS OVERLAY SHARE BOX */}
        <div className="p-3 bg-rose-50/30 dark:bg-rose-950/5 border border-rose-100/50 dark:border-rose-900/20 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <MonitorPlay size={13} className="text-rose-500" />
              <span>OBS Studio Live Overlay</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400">Add as Browser Source</span>
          </div>
          <div className="flex gap-1.5">
            <button
              id="lobby-copy-overlay-btn"
              onClick={handleCopyOverlayUrl}
              className="flex-1 py-2 bg-white dark:bg-slate-950 text-[11px] font-semibold text-rose-500 hover:text-white hover:bg-rose-500 border border-slate-200 dark:border-slate-800 rounded-xl transition-all flex items-center justify-center gap-1.5 focus:outline-none"
            >
              <Copy size={13} />
              <span>{copied ? 'Copied!' : 'Copy Overlay URL'}</span>
            </button>
            <a
              id="lobby-preview-overlay-btn"
              href={overlayHref}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-indigo-50/50 dark:bg-indigo-950/10 text-[11px] font-semibold text-indigo-500 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl transition-colors flex items-center justify-center gap-1 focus:outline-none"
            >
              <ExternalLink size={13} />
              <span>Live Test</span>
            </a>
          </div>
        </div>
      </div>

      {/* PLAYERS LIST TABLE WITH RAPID SCORE ACTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Player Rankings ({filteredPlayers.length})
          </h3>
          
          <div className="relative w-40 sm:w-48">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="player-search-box"
              type="text"
              placeholder="Filter players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-rose-500/20"
            />
          </div>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-10 text-center shadow-inner">
            <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 mx-auto mb-2 border border-slate-100 dark:border-slate-900/60">
              <Trophy size={18} className="text-slate-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400">No score records yet</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Tap the large pink button at the bottom of your screen to log a game winner.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPlayers.map((player, index) => {
              const rank = index + 1;
              const isEditing = editingPlayerId === player.id;

              return (
                <div
                  id={`player-ranking-row-${player.id}`}
                  key={player.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* Position indicator */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {rank === 1 ? (
                        <Medal size={18} className="text-amber-500" />
                      ) : rank === 2 ? (
                        <Medal size={18} className="text-slate-400" />
                      ) : rank === 3 ? (
                        <Medal size={18} className="text-amber-700" />
                      ) : (
                        <span className="font-mono text-slate-400">#{rank}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                        @{player.username}
                      </span>
                    </div>
                  </div>

                  {/* SCORE BOOST CONTROL PANELS */}
                  <div className="flex items-center gap-2shrink-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          id={`player-edit-wins-${player.id}`}
                          type="number"
                          value={editingScore}
                          onChange={(e) => setEditingScore(parseInt(e.target.value) || 0)}
                          className="w-14 px-1.5 py-1 text-center bg-slate-50 dark:bg-slate-950 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none"
                          min="0"
                          autoFocus
                        />
                        <button
                          id={`player-save-wins-${player.id}`}
                          onClick={() => handleSaveScore(player.id)}
                          className="p-1 px-2 bg-emerald-500 text-white rounded-lg text-xs font-bold focus:outline-none"
                          type="button"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 max-w-full">
                        
                        {/* Rapid Increment controls */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-1 rounded-xl flex items-center gap-1 border border-slate-100 dark:border-slate-900/50">
                          <button
                            id={`player-decrement-${player.id}`}
                            onClick={() => handleQuickAdjust(player, -1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
                            type="button"
                          >
                            <Minus size={13} />
                          </button>
                          
                          <span
                            id={`player-wins-display-${player.id}`}
                            onClick={() => startEditing(player)}
                            className="px-2 font-mono text-xs font-black text-rose-500 cursor-pointer min-w-5 text-center hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                          >
                            {player.wins}
                          </span>

                          <button
                            id={`player-increment-${player.id}`}
                            onClick={() => handleQuickAdjust(player, 1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
                            type="button"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Dropdown deletion action triggers */}
                        <button
                          id={`player-delete-btn-${player.id}`}
                          onClick={() => deletePlayer(player.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 rounded-xl transition-colors focus:outline-none ml-1.2"
                          type="button"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM RESET MODAL DIALOG DRAWERS */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 max-w-sm w-full z-10 text-center select-none space-y-4 shadow-2xl">
            <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
              <ShieldAlert size={24} />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Score Leaderboard?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                This action is <strong>irreversible</strong>. You will clear the current session players and reset all counts to zero.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                id="reset-cancel"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl focus:outline-none"
              >
                Cancel
              </button>
              <button
                id="reset-confirm"
                onClick={handleConfirmReset}
                className="flex-1 py-3 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg focus:outline-none"
              >
                Clear Lobbies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY MAIN ACTION BUTTON IN PORTRAIT */}
      <div className="fixed bottom-20 left-0 right-0 px-4 md:px-0 md:absolute md:bottom-2 md:left-2 md:right-2 z-30 pointer-events-none">
        <button
          id="detail-add-winner-trigger"
          onClick={() => setIsAddWinnerOpen(true)}
          className="pointer-events-auto w-full md:max-w-md mx-auto py-4 rounded-2xl text-sm font-bold text-white tiktok-gradient-primary shadow-xl shadow-rose-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-500/20"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Game Winner</span>
        </button>
      </div>

      <WinnerModal
        isOpen={isAddWinnerOpen}
        onClose={() => setIsAddWinnerOpen(false)}
        onSave={async (username, winAmt) => {
          await addGameWinner(currentTournament.id, username, winAmt);
        }}
      />

    </div>
  );
};
