import { motion, AnimatePresence } from 'framer-motion';
import {TransactionState} from '@/lib/utils'

interface TransactionModalProps {
  state: TransactionState;
  onClose: () => void;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  pending: {
    icon: <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full" />,
    color: 'text-accent',
  },
  success: {
    icon: <div className="w-10 h-10 rounded-full bg-sol-green/10 flex items-center justify-center"><svg className="w-5 h-5 text-sol-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>,
    color: 'text-sol-green',
  },
  error: {
    icon: <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div>,
    color: 'text-destructive',
  },
};

export function TransactionModal({ state, onClose }: TransactionModalProps) {
  const isOpen = state.status !== 'idle';
  const canClose = state.status === 'success' || state.status === 'error';
  const config = statusConfig[state.status] || statusConfig.preparing;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={canClose ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-8 max-w-sm w-full text-center"
          >
            <div className="flex justify-center mb-5">{config.icon}</div>
            <p className={`font-display font-semibold text-lg mb-2 ${config.color}`}>{state.message}</p>
            {state.error && <p className="text-destructive text-sm mt-2">{state.error}</p>}
            {state.txSignature && state.status === 'success' && (
              <a
                href={`https//solscan.io/tx/${state.txSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-accent hover:underline"
              >
                View on Explorer →
              </a>
            )}
            {canClose && (
              <button onClick={onClose} className="mt-6 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-display text-sm font-medium hover:bg-secondary/80 transition-colors">
                Close
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
