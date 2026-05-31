import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Trophy, Calendar, ChevronRight, Plus, FolderHeart, ArrowUpDown } from 'lucide-react';
import { Game } from '../types';

interface ListGamesTabProps {
  onSelectGame: (gameId: string) => void;
  onRequestCreateGame: () => void;
}

const TYPE_FILTERS = ['All', 'Puzzle', 'Arcade', 'Word Guess', 'Quiz', 'Other'];

export const ListGamesTab: React.FC<ListGamesTabProps> = ({
  onSelectGame,
  onRequestCreateGame,
}) => {
  const { games } = useApp();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortByNewest, setSortByNewest] = useState(true);

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
    <div className="space-y-4 pb-28 md:pb-6 relative select-none">
      
      {/* HEADER ROW */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2rem] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white leading-none">
              Stream Rooms
            </h2>
            <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
              useApp().isSupabaseConnected 
                ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900" 
                : "text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-900"
            }`}>
              {useApp().isSupabaseConnected ? "Live" : "Local Only"}
            </span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredGames.map((game) => (
            <div
              id={`game-lobby-card-${game.id}`}
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between group h-36"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 px-2.5 py-0.5 rounded-full truncate">
                    {game.game_type}
                  </span>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium font-mono">
                    <Calendar size={11} />
                    <span>
                      {new Date(game.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-2.5 line-clamp-1 truncate group-hover:text-rose-500 transition-colors">
                  {game.title}
                </h3>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-950 pt-2.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  ID: <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{game.id}</span>
                </span>

                <button
                  id={`open-lobby-btn-${game.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGame(game.id);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full border border-rose-100/30 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all focus:outline-none"
                >
                  <span>Open</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MOBILE PORTRAIT FLOATING LAUNCH CONTAINER ACTION */}
      <button
        id="floating-create-game"
        onClick={onRequestCreateGame}
        className="md:hidden fixed bottom-20 right-5 z-40 p-4 rounded-full text-white tiktok-gradient-primary shadow-xl shadow-rose-500/20 active:scale-95 transition-transform cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-500/10"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

    </div>
  );
};
