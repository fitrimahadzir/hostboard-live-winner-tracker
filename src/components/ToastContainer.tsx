import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            id={`toast-${toast.id}`}
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-500/95 border-emerald-400 text-white'
                : toast.type === 'error'
                  ? 'bg-rose-500/95 border-rose-400 text-white'
                  : 'bg-slate-950/90 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle size={18} className="shrink-0" />}
              {toast.type === 'error' && <AlertTriangle size={18} className="shrink-0" />}
              {toast.type === 'info' && <Info size={18} className="shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              id={`toast-close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-white/15 transition-colors focus:outline-none"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
