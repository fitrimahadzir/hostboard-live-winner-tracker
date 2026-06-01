import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEV_MODE } from '../config/env';
import { Search, ChevronRight, Plus, FolderHeart, ArrowUpDown, Trash2 } from 'lucide-react';

interface ListGamesTabProps {
  onSelectGame: (gameId: string) => void;
  onRequestCreateGame: () => void;
}

const TYPE_FILTERS = ['All', 'Puzzle', 'Arcade', 'Word Guess', 'Quiz', 'Other'];

export const ListGamesTab: React.FC<ListGamesTabProps> = ({
  onSelectGame,
  onRequestCreateGame,
}) => {
  const { games, deleteGame } = useApp();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortByNewest, setSortByNewest] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Filter and sort core logic
  const filteredGames = games
    .filter((g) => {
      const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedType === 'All' || g.game_type === selectedType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      const tA = new Date(a.created_at).getTime();
      const tB = new Date(b.created_at).getTime();
      return sortByNewest ? tB - tA : tA - tB;
    });

  return (
    <div className="space-y-4 pb-28 relative select-none">
      
      {/* HEADER ROW */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2rem] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white leading-none">
              Stream Rooms
            </h2>
            {(useApp().isSupabaseConnected || DEV_MODE) && (
              <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                useApp().isSupabaseConnected 
                  ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900" 
                  : "text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-900"
              }`}>
                {useApp().isSupabaseConnected ? "Live" : "Local Only"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Manage your active livestream game lobbies ({games.length})
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH ZONE */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" />
            <input
              id="game-search-input"
              type="text"
              placeholder="Search game title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
            />
          </div>

          {/* Toggle sort button */}
          <button
            id="toggle-sort-order"
            type="button"
            onClick={() => setSortByNewest(!sortByNewest)}
            className="p-3 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm text-slate-600 dark:text-slate-400 focus:outline-none"
            title="Sort order"
          >
            <ArrowUpDown size={15} />
          </button>
        </div>

        {/* Horizontal filters tags */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {TYPE_FILTERS.map((filter) => (
            <button
              id={`game-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
              key={filter}
              onClick={() => setSelectedType(filter)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedType === filter
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* GAMES GRID LIST */}
      {filteredGames.length === 0 ? (
        /* Empty Sandbox Filter view state */
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] py-14 px-6 text-center shadow-inner">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 mx-auto mb-3 border border-slate-100 dark:border-slate-900/60">
            <FolderHeart size={20} className="text-slate-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No rooms matched</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
            Try resetting your filters or start a new game directly underneath the list.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredGames.map((game) => (
            <div
              id={`game-lobby-card-${game.id}`}
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99] transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 font-bold text-[10px] text-slate-400 uppercase shrink-0">
                  <span className="text-rose-500 font-extrabold">
                    {game.game_type.substring(0, 3)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {game.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Type:{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {game.game_type}
                    </span>{" "}
                    •{" "}
                    {new Date(game.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/60 px-2.5 py-1 rounded-full group-hover:bg-rose-50 dark:group-hover:bg-rose-950/20 group-hover:text-rose-600 group-hover:border-rose-200 transition-colors">
                  Go to
                </span>
                <ChevronRight
                  size={15}
                  className="text-slate-300 dark:text-slate-700"
                />
                <button
                  id={`delete-lobby-btn-${game.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(game.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-colors focus:outline-none"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 max-w-sm w-full z-10 text-center select-none space-y-4 shadow-2xl">
            <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
              <Trash2 size={24} />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Game Room?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                This action is <strong>irreversible</strong>. All players and scores for this room will be permanently removed.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                id="delete-cancel"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl focus:outline-none"
              >
                Cancel
              </button>
              <button
                id="delete-confirm"
                onClick={() => {
                  deleteGame(deleteTarget);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-3 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE PORTRAIT FLOATING LAUNCH CONTAINER ACTION */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-40 pointer-events-none">
        <div className="flex justify-end">
          <button
            id="floating-create-game"
            onClick={onRequestCreateGame}
            className="pointer-events-auto p-4 rounded-full text-white tiktok-gradient-primary shadow-xl shadow-rose-500/20 active:scale-95 transition-transform cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-500/10"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

    </div>
  );
};
