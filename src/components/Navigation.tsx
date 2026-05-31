import React from 'react';
import { Home, Trophy, User, PlusCircle, Bell } from 'lucide-react';

interface NavigationProps {
  activeTab: 'home' | 'games' | 'activity' | 'profile';
  setActiveTab: (tab: 'home' | 'games' | 'activity' | 'profile') => void;
  onRequestCreateGame: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onRequestCreateGame,
}) => {
  return (
    <>
      {/* MOBILE STICKY BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-800/50 rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.2)] safe-padding-bottom">
        <div className="grid grid-cols-5 items-center justify-around h-16 max-w-lg mx-auto px-2 relative">
          
          {/* HOME TAB */}
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className="relative flex flex-col items-center justify-center h-full transition-colors focus:outline-none"
          >
            <div className={`relative p-1 transition-transform duration-300 ${activeTab === 'home' ? 'text-rose-500 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
              <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              {activeTab === 'home' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium transition-all ${activeTab === 'home' ? 'text-rose-500 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
              Home
            </span>
          </button>

          {/* LIST GAME (TOURNAMENTS) TAB */}
          <button
            id="nav-tab-games"
            onClick={() => setActiveTab('games')}
            className="relative flex flex-col items-center justify-center h-full transition-colors focus:outline-none"
          >
            <div className={`relative p-1 transition-transform duration-300 ${activeTab === 'games' ? 'text-rose-500 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
              <Trophy size={22} strokeWidth={activeTab === 'games' ? 2.5 : 2} />
              {activeTab === 'games' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium transition-all ${activeTab === 'games' ? 'text-rose-500 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
              Games
            </span>
          </button>

          {/* QUICK START TOURNAMENT BUTTON (TikTok LIVE Fast Entry) */}
          <button
            id="nav-quick-create"
            onClick={onRequestCreateGame}
            className="flex flex-col items-center justify-center h-full focus:outline-none"
          >
            <div className="tiktok-gradient-primary text-white p-2.5 rounded-full shadow-lg shadow-rose-500/20 active:scale-95 transition-transform">
              <PlusCircle size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] mt-0.5 font-medium text-slate-400 dark:text-slate-500">
              New Game
            </span>
          </button>

          {/* ACTIVITY (NOTIFICATION) TAB */}
          <button
            id="nav-tab-activity"
            onClick={() => setActiveTab('activity')}
            className="relative flex flex-col items-center justify-center h-full transition-colors focus:outline-none"
          >
            <div className={`relative p-1 transition-transform duration-300 ${activeTab === 'activity' ? 'text-rose-500 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
              <Bell size={22} strokeWidth={activeTab === 'activity' ? 2.5 : 2} />
              {activeTab === 'activity' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium transition-all ${activeTab === 'activity' ? 'text-rose-500 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
              Activity
            </span>
          </button>

          {/* PROFILE TAB */}
          <button
            id="nav-tab-profile"
            onClick={() => setActiveTab('profile')}
            className="relative flex flex-col items-center justify-center h-full transition-colors focus:outline-none"
          >
            <div className={`relative p-1 transition-transform duration-300 ${activeTab === 'profile' ? 'text-rose-500 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
              <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              {activeTab === 'profile' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium transition-all ${activeTab === 'profile' ? 'text-rose-500 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
              Profile
            </span>
          </button>

        </div>
      </div>

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200/50 dark:border-slate-800/50 px-5 py-6">
        <div className="flex items-center gap-3 px-2 mb-8 select-none">
          <div className="tiktok-gradient-primary w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-900 to-rose-600 dark:from-white dark:to-cyan-400 bg-clip-text text-transparent">
              HostBoard
            </h1>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Live Scores
            </p>
          </div>
        </div>

        <nav id="desktop-sidebar-menu" className="flex-1 flex flex-col gap-1.5">
          <button
            id="sidebar-home-btn"
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold shadow-inner'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900'
            }`}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            id="sidebar-games-btn"
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'games'
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold shadow-inner'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900'
            }`}
          >
            <Trophy size={18} />
            <span>Manage Games</span>
          </button>

          <button
            id="sidebar-activity-btn"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'activity'
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold shadow-inner'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900'
            }`}
          >
            <Bell size={18} />
            <span>Activity Logs</span>
          </button>

          <button
            id="sidebar-profile-btn"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold shadow-inner'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900'
            }`}
          >
            <User size={18} />
            <span>Host Profile</span>
          </button>

          <div className="my-6 border-t border-slate-100 dark:border-slate-900" />

          <button
            id="sidebar-create-game-btn"
            onClick={onRequestCreateGame}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold text-white tiktok-gradient-primary shadow-lg shadow-rose-500/10 hover:shadow-rose-500/25 active:scale-98 transition-all"
          >
            <PlusCircle size={18} />
            <span>Start New Game</span>
          </button>
        </nav>

        <div className="mt-auto px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/30 flex items-center gap-3 border border-slate-100 dark:border-slate-900/50">
          <div className="relative">
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-950" />
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
              ⚡
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold truncate max-w-[120px]">Live Session</p>
            <p className="text-[10px] text-emerald-500 font-medium">Ready for OBS</p>
          </div>
        </div>
      </aside>
    </>
  );
};
