import React, { useState, useEffect } from 'react';
import { X, Award, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (username: string, wins: number) => Promise<void>;
  suggestedUsernames?: string[];
}

const WIN_PRESETS = [1, 2, 3, 5, 10];

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suggestedUsernames = [],
}) => {
  const { addToast } = useApp();
  const [username, setUsername] = useState('');
  const [winAmount, setWinAmount] = useState<number>(1);
  const [customWinsInput, setCustomWinsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setWinAmount(1);
      setCustomWinsInput('');
      setIsCustomMode(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    let finalWins = winAmount;
    if (isCustomMode) {
      const parsed = parseInt(customWinsInput);
      if (!isNaN(parsed) && parsed > 0) {
        finalWins = parsed;
      } else {
        finalWins = 1;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave(username.trim(), finalWins);
      onClose();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to add winner score', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPreset = (num: number) => {
    setIsCustomMode(false);
    setWinAmount(num);
  };

  const activateCustom = () => {
    setIsCustomMode(true);
    setCustomWinsInput('1');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          
          {/* Backdrop */}
          <motion.div
            id="add-winner-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal popup */}
          <motion.div
            id="add-winner-sheet"
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[2rem] shadow-2xl border-t md:border border-slate-100 dark:border-slate-800 p-6 md:p-7 z-10 select-none pb-12 md:pb-7"
          >
            {/* Drag Handle for Mobile */}
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-5 md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-yellow-500">
                  <Award size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add Game Winner
                </h3>
              </div>
              <button
                id="add-winner-close"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Winner Username
                  </label>
                  <span className="text-[10px] text-slate-400">@ gets stripped automatically</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-semibold text-sm">@</span>
                  <input
                    id="winner-username-input"
                    type="text"
                    placeholder="winner_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium overflow-ellipsis focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                    required
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                  />
                </div>
              </div>

              {/* Score Preset Selection Row */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Assign Wins / Points
                </label>
                <div className="flex flex-wrap gap-2">
                  {WIN_PRESETS.map((num) => (
                    <button
                      id={`winner-preset-${num}`}
                      key={num}
                      type="button"
                      onClick={() => selectPreset(num)}
                      className={`flex-1 min-w-[50px] py-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-0.5 ${
                        !isCustomMode && winAmount === num
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400 shadow-sm'
                          : 'border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-800'
                      }`}
                    >
                      <span>+{num}</span>
                    </button>
                  ))}
                  <button
                    id="winner-custom-toggle"
                    type="button"
                    onClick={activateCustom}
                    className={`flex-2 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                      isCustomMode
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400 shadow-sm'
                        : 'border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-800'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Custom Points Block */}
              <AnimatePresence>
                {isCustomMode && (
                  <motion.div
                    id="custom-wins-drawer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pt-1">
                      <input
                        id="winner-custom-input"
                        type="number"
                        placeholder="Type Custom Score (e.g., 25)"
                        value={customWinsInput}
                        min="1"
                        onChange={(e) => setCustomWinsInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  id="add-winner-cancel"
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  id="add-winner-submit"
                  type="submit"
                  disabled={isSubmitting || !username.trim()}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white tiktok-gradient-primary shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <ChevronUp size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Add Points'}</span>
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
