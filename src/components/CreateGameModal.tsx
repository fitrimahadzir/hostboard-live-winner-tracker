import React, { useState } from 'react';
import { X, Play, Gamepad2 } from 'lucide-react';
import { GameType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, gameType: string) => Promise<void>;
}

const GAME_TYPES: GameType[] = [
  'Odd One Out',
  'Word Guess',
  'Quiz',
  'Lucky Draw',
  'Number Hunt',
  'Custom',
];

export const CreateGameModal: React.FC<CreateGameModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [gameType, setGameType] = useState<GameType>('Odd One Out');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate(title.trim(), gameType);
      setTitle('');
      setGameType('Odd One Out');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          
          {/* Backdrop Overlay */}
          <motion.div
            id="create-game-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            id="create-game-sheet"
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[2rem] shadow-2xl border-t md:border border-slate-100 dark:border-slate-800 p-6 md:p-7 z-10 select-none pb-12 md:pb-7"
          >
            {/* Drag Handle Indicator for Mobile Bottom Sheet */}
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-5 md:hidden" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
                  <Gamepad2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add New Live Game
                </h3>
              </div>
              <button
                id="create-game-close"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Game Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Game Name / Round Title
                </label>
                <input
                  id="create-game-title"
                  type="text"
                  placeholder="e.g., Level 1 Challenge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Game Type Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Game Mode Selection
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {GAME_TYPES.map((type) => (
                    <button
                      id={`game-type-opt-${type.replace(/\s+/g, '-').toLowerCase()}`}
                      key={type}
                      type="button"
                      onClick={() => setGameType(type)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        gameType === type
                          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                          : 'border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Sheet buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  id="create-game-cancel"
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500/10"
                >
                  Cancel
                </button>
                <button
                  id="create-game-submit"
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white tiktok-gradient-primary shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <Play size={16} fill="currentColor" />
                  <span>{isSubmitting ? 'Starting...' : 'Start Game'}</span>
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
