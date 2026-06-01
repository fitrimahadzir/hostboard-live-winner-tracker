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
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-800/50 rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.2)] safe-padding-bottom">
      <div className="grid grid-cols-5 items-center justify-around h-16 max-w-lg mx-auto px-2 relative">
        
        {/* HOME TAB */}
        <button
          id="nav-tab-home"
          onClick={() => setActiveTab('home')}
          className="relative flex flex-col items-center justify-center h-full transition-colors focus:outline-none"
        >
          <div className={`relative p-1 transition-transform duration-300 ${activeTab === 'home' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
            <Home size={22} strokeWidth={2} />
          </div>
          <span className={`text-[10px] mt-0.5 font-medium transition-all ${activeTab === 'home' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
            Home
          </span>
        </button>

        {/* LIST GAME (TOURNAMENTS) TAB */}
        <button
          id="nav-tab-games"
          onClick={() => setActiveTab('games')}
          className="relative flex flex-col items-center justify-center h-full transition-colors focus:outline-none"
        >
          <div className={`relative p-1 transition-transform duration-300 ${activeTab === 'games' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
            <Trophy size={22} strokeWidth={2} />
          </div>
          <span className={`text-[10px] mt-0.5 font-medium transition-all ${activeTab === 'games' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
            Games
          </span>
        </button>

        {/* QUICK START TOURNAMENT BUTTON (Fast Entry) */}
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
          <div className={`relative p-1 transition-transform duration-300 ${activeTab === 'activity' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
            <Bell size={22} strokeWidth={2} />
          </div>
          <span className={`text-[10px] mt-0.5 font-medium transition-all ${activeTab === 'activity' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
            Activity
          </span>
        </button>

        {/* PROFILE TAB */}
        <button
          id="nav-tab-profile"
          onClick={() => setActiveTab('profile')}
          className="relative flex flex-col items-center justify-center h-full transition-colors focus:outline-none"
        >
          <div className={`relative p-1 transition-transform duration-300 ${activeTab === 'profile' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
            <User size={22} strokeWidth={2} />
          </div>
          <span className={`text-[10px] mt-0.5 font-medium transition-all ${activeTab === 'profile' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
            Profile
          </span>
        </button>

      </div>
    </div>
  );
};
