import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { dbService } from '../lib/supabase';
import { 
  User, Mail, Trophy, Moon, Sun, LogOut, Download, FileSpreadsheet, 
  Settings, ArrowRight, HeartHandshake, Database
} from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const { user, games, theme, toggleTheme, signOut, addToast } = useApp();
  const [selectedGameToExport, setSelectedGameToExport] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    const targetGameId = selectedGameToExport || (games.length > 0 ? games[0].id : null);
    if (!targetGameId) {
      addToast('Create some games prior to exporting leaderboard reports', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const targetGame = games.find(g => g.id === targetGameId);
      const players = await dbService.players.fetchAllForGame(targetGameId);

      if (players.length === 0) {
        addToast(`No scores logged for game "${targetGame?.title || 'Unknown'}"`, 'info');
        setIsExporting(false);
        return;
      }

      // Generate CSV string content
      const headers = ['Rank', 'Player Username', 'Wins/Score', 'Created Timestamp'];
      const rows = players.map((p, index) => [
        index + 1,
        `@${p.username}`,
        p.wins,
        new Date(p.created_at).toLocaleString()
      ]);

      const csvContent = 
        'data:text/csv;charset=utf-8,' + 
        [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      
      const fileName = `LIVEReport_${targetGame?.title.replace(/\s+/g, '_') || 'Game'}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);

      addToast('Leaderboard exported to CSV!', 'success');
    } catch (err) {
      addToast('CSV Generation triggered a local error', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6 text-left select-none">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          Host Profile
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Manage your TikTok host settings, display styles, and reports
        </p>
      </div>

      {/* USER INFORMATION CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <img
            id="profile-avatar-large"
            src={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.id || 'profile'}`}
            alt="Profile Avatar"
            className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 dark:border-slate-800 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              @{user?.username || 'GamerHost'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 mt-1">
              <Mail size={13} />
              <span className="truncate">{user?.email || 'host@tiktok.com'}</span>
            </p>
          </div>
        </div>

        {/* Global Statistics overview */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100/60 dark:border-slate-900/40">
          <div>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Active rounds</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{games.length} Lobbies</p>
          </div>
          <div className="border-l border-slate-200/50 dark:border-slate-800/50 pl-3">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Stream Engine</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Dual-Sandbox</p>
          </div>
        </div>
      </div>

      {/* REACTION STYLING PREFERENCES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-3.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Style Preferences
        </h4>

        {/* Dark theme toggle row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Dark Mode Contrast</p>
              <p className="text-[10px] text-slate-400">Safe contrast for midnight streams</p>
            </div>
          </div>

          <button
            id="profile-theme-toggle"
            onClick={toggleTheme}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
              theme === 'dark' ? 'bg-rose-500' : 'bg-slate-200'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
              theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* CSV EXPORTER CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <FileSpreadsheet size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Session Leaderboard Export
            </h4>
            <p className="text-[10px] text-slate-400">Export scores to CSV file format</p>
          </div>
        </div>

        {games.length === 0 ? (
          <p className="text-[11px] text-slate-400 font-medium">No games started to generate exports yet.</p>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select game to export</label>
              <select
                id="export-game-selector"
                value={selectedGameToExport}
                onChange={(e) => setSelectedGameToExport(e.target.value)}
                className="w-full px-3.5 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none font-medium"
              >
                <option value="">-- Latest Active Game --</option>
                {games.map(game => (
                  <option id={`export-game-opt-${game.id}`} key={game.id} value={game.id}>
                    {game.title} ({game.game_type})
                  </option>
                ))}
              </select>
            </div>

            <button
              id="profile-export-csv"
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="w-full py-3 bg-white dark:bg-slate-950 text-xs font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white border border-slate-200 dark:border-slate-800 duration-150 rounded-xl flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isExporting ? 'Compiling Excel Report...' : 'Download Leaderboard CSV'}</span>
            </button>
          </div>
        )}
      </div>

      {/* LOG OUT ACTION */}
      <button
        id="profile-logout-btn"
        onClick={signOut}
        className="w-full py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-rose-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none shadow-sm"
      >
        <LogOut size={14} />
        <span>Log Out Streamer Session</span>
      </button>

    </div>
  );
};
