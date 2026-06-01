import React from "react";
import { useApp } from "../context/AppContext";
import { DEV_MODE } from "../config/env";
import md5 from "md5";
import {
  Trophy,
  Users,
  Star,
  Plus,
  ShieldCheck,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import { Game } from "../types";

interface HomeTabProps {
  onSelectGame: (gameId: string) => void;
  onRequestCreateGame: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onSelectGame,
  onRequestCreateGame,
}) => {
  const { user, games, isSupabaseConnected } = useApp();

  // Calculate live stats
  const totalGames = games.length;

  // Simulated stats for nicer live representation on dashboard
  const sampleBestPerformance =
    games.length > 0 ? games[0].title : "No rounds started";
  const statusBadge = isSupabaseConnected
    ? "Live Syncing"
    : "Offline Mode";

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Hero header */}
      <div className="bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div>
            {(isSupabaseConnected || DEV_MODE) && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/30">
                {statusBadge}
              </span>
            )}
            <h1 className="text-xl font-bold tracking-tight mt-3 text-white">
              Welcome back, {user?.username || "Host"}!
            </h1>
            <p className="text-xs text-rose-100/70 mt-1 max-w-[245px] sm:max-w-none">
              Track wins, declare champions, and feed real-time OBS graphics in
              one click.
            </p>
          </div>
          <img
            id="host-hero-avatar"
            src={
              user?.avatar_url ||
              (user?.email
                ? `https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}?d=mp`
                : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.id || "host"}`)
            }
            alt="Host Avatar"
            className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shadow-md shrink-0 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* QUICK QUICK ACTION BAR */}
      <button
        id="home-quick-start"
        onClick={onRequestCreateGame}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow active:scale-[0.99] transition-all group text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="tiktok-gradient-primary text-white p-2.5 rounded-xl block">
            <Plus size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
              Start New Live Round
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Launch Puzzle, word guess or arcade
            </p>
          </div>
        </div>
        <ChevronRight
          size={18}
          className="text-slate-300 group-hover:text-rose-500 transition-colors"
        />
      </button>

      {/* QUICK STATS PANELS - Mobile app style responsive grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Games Created */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Games
            </span>
            <div className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500">
              <Trophy size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {totalGames}
            </h3>
            <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
              • Stream sessions active
            </p>
          </div>
        </div>

        {/* Highest Active Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Best Live Round
            </span>
            <div className="p-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500">
              <Star size={16} />
            </div>
          </div>
          <div className="mt-3 overflow-hidden">
            <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white">
              {sampleBestPerformance}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate">
              Latest Live Round
            </p>
          </div>
        </div>
      </div>

      {/* RECENT LIVESTREAM GAMES SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Recent LIVE Games ({games.slice(0, 5).length})
          </h3>
        </div>

        {games.length === 0 ? (
          /* Empty Sandbox State */
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 text-center shadow-inner">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 mx-auto mb-3 border border-slate-100 dark:border-slate-900/60">
              <PlayCircle size={22} className="text-slate-400" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No active game lobbies
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Launch a live score tracker game using the button above and add
              player handles!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {games.slice(0, 5).map((game) => (
              <div
                id={`recent-game-card-${game.id}`}
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
                    Manage
                  </span>
                  <ChevronRight
                    size={15}
                    className="text-slate-300 dark:text-slate-700"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STREAMER TIPS FOOTER SECTION */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Pro streams integration tip</h4>
          <p className="opacity-90 mt-0.5 leading-relaxed">
            Configure a browser source overlay in OBS using the link inside any
            game lobby. Players see their rankings update immediately with zero
            delay.
          </p>
        </div>
      </div>
    </div>
  );
};
