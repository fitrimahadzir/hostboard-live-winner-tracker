import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dbService } from '../lib/supabase';
import { ActivityLog } from '../types';
import { DEV_MODE } from '../config/env';
import { 
  Bell, 
  Award, 
  Gamepad2, 
  Zap, 
  Sparkles, 
  Trash2, 
  Filter, 
  Clock,
  LayoutGrid
} from 'lucide-react';

const getRelativeTime = (isoString: string): string => {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const ActivityTab: React.FC = () => {
  const { user, addToast } = useApp();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'wins' | 'games' | 'system'>('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!user) return;
    try {
      const fetched = await dbService.activityLogs.fetchAll(user.id);
      setLogs(fetched);
    } catch (e: any) {
      console.error('Error fetching logs:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    if (!user) return;

    // Set up Supabase Postgres Change payload or Sandbox listener
    const unsubscribe = dbService.activityLogs.subscribeToActivity(user.id, () => {
      fetchLogs();
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Handle Mock event insertions directly from Dev actions UI
  const handleInsertSampleLog = async (type: 'wins' | 'game_created' | 'score_updated' | 'system') => {
    if (!user) return;
    let title = '';
    let meta = {};
    
    if (type === 'wins') {
      title = `@Player_X scored +3 wins!`;
      meta = { game_title: 'Puzzle', player_name: 'Player_X', wins: 3 };
    } else if (type === 'game_created') {
      title = 'New game "Arcade Round" was started';
      meta = { game_title: 'Arcade Round', game_type: 'Arcade' };
    } else if (type === 'score_updated') {
      title = "Adjusted @StreamChamp's score to 12 wins";
      meta = { player_name: 'StreamChamp', wins: 12 };
    } else {
      title = 'HostBoard engine connected to cloud';
      meta = {};
    }

    try {
      await dbService.activityLogs.create(user.id, type, title, meta);
      addToast('Simulated event inserted!', 'success');
      fetchLogs();
    } catch (err) {
      addToast('Simulation insert failed', 'error');
    }
  };

  const handleClearSandboxLogs = () => {
    if (!user) return;
    localStorage.removeItem('sb_activity_logs');
    setLogs([]);
    addToast('Sandbox activity logs cleared!', 'success');
  };

  // Filter selection helper
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'wins') return log.type === 'wins';
    if (filter === 'games') return log.type === 'game_created' || log.type === 'score_updated';
    if (filter === 'system') return log.type === 'system';
    return true;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-6 select-none relative animate-fade-in">
      
      {/* Primary Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 uppercase">
            Official Activity
          </span>
          {user && (useApp().isSupabaseConnected || DEV_MODE) && (
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${
              useApp().isSupabaseConnected 
                ? "text-cyan-300 bg-cyan-500/20 border-cyan-500/30" 
                : "text-slate-300 bg-slate-500/20 border-slate-500/30"
            }`}>
              {useApp().isSupabaseConnected ? "Live Syncing" : "Offline Mode"}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold tracking-tight">
          Activity Stream
        </h1>
        <p className="text-xs text-rose-100/70 mt-1 max-w-sm">
          Keep track of everything happening in your stream rooms in real-time.
        </p>
      </div>

      {/* FILTER BUTTON TAB BAR */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-250/20 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filter === 'all' 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('wins')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filter === 'wins' 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Wins 🏆
        </button>
        <button
          onClick={() => setFilter('games')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filter === 'games' 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Round Actions 🎮
        </button>
        <button
          onClick={() => setFilter('system')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            filter === 'system' 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          System ⚙️
        </button>
      </div>

      {/* CORE CARDS LIST AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin text-rose-500 w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">polling events...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/5 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 shadow-inner">
            <Bell size={26} strokeWidth={1.5} className="animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No activity yet</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
            Events will automatically populate here when players score points on live lobbies, new games start, or parameters change.
          </p>

          {/* Quick simulation buttons when local sandbox triggers are handy */}
          {DEV_MODE && (
            <div className="mt-8 flex flex-col md:flex-row gap-2 w-full justify-center max-w-sm">
              <button
                onClick={() => handleInsertSampleLog('wins')}
                className="px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/45 rounded-xl text-[10px] font-bold uppercase transition-all"
              >
                + Simulate Player Win
              </button>
              <button
                onClick={() => handleInsertSampleLog('game_created')}
                className="px-3.5 py-2 hover:bg-slate-55 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase transition-all border border-transparent dark:border-slate-700"
              >
                + Simulate Game Start
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Recent Events ({filteredLogs.length})
            </span>
            {logs.length > 0 && (
              <button
                onClick={handleClearSandboxLogs}
                className="text-xs font-semibold text-rose-500/80 hover:text-rose-500 flex items-center gap-1 hover:underline transition-colors focus:outline-none"
              >
                <Trash2 size={13} />
                <span>Clear history</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {filteredLogs.map((log) => {
              // Custom rendering metadata per log type
              let colorClasses = 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-100 dark:border-rose-950 text-rose-500';
              let IconComponent = Bell;

              if (log.type === 'wins') {
                colorClasses = 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-100 dark:border-amber-950 text-amber-500';
                IconComponent = Award;
              } else if (log.type === 'game_created') {
                colorClasses = 'bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-950 text-cyan-500';
                IconComponent = Gamepad2;
              } else if (log.type === 'score_updated') {
                colorClasses = 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-100 dark:border-rose-950 text-rose-500';
                IconComponent = Zap;
              } else if (log.type === 'system') {
                colorClasses = 'bg-slate-500/5 dark:bg-slate-500/10 border-slate-200 dark:border-slate-850 text-slate-500';
                IconComponent = Sparkles;
              }

              return (
                <div 
                  key={log.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-3xl shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300"
                >
                  <div className={`p-2.5 border rounded-2xl ${colorClasses} shrink-0`}>
                    <IconComponent size={18} strokeWidth={2.3} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                        {log.type === 'game_created' ? 'game start' : log.type === 'wins' ? 'winner check' : log.type === 'score_updated' ? 'score modified' : 'stream center'}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400 dark:text-slate-500">
                        <Clock size={10} />
                        <span>{getRelativeTime(log.created_at)}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate leading-snug">
                      {log.title}
                    </h4>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 font-mono text-[9px]">
                        {log.metadata.game_title && (
                          <span className="px-2 py-0.5 roundedbg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 flex items-center gap-1 border border-slate-200/50 dark:border-slate-800 border-none rounded-lg">
                            🎮 {log.metadata.game_title}
                          </span>
                        )}
                        {log.metadata.player_name && (
                          <span className="px-2 py-0.5 bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 flex items-center gap-0.5 rounded-lg">
                            👤 @{log.metadata.player_name}
                          </span>
                        )}
                        {log.metadata.wins !== undefined && (
                          <span className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5 rounded-lg font-bold">
                            ★ {log.metadata.wins} wins
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick simulation bar at the bottom for quick triggers */}
          {DEV_MODE && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl mt-4 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Activity Simulator</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Simulate events to test your overlays</p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button 
                  onClick={() => handleInsertSampleLog('wins')} 
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-colors border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-bold uppercase"
                >
                  + Win Record
                </button>
                <button 
                  onClick={() => handleInsertSampleLog('game_created')} 
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-colors border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-bold uppercase"
                >
                  + Game Create
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
