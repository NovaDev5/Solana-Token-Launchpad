import { useState, useCallback } from 'react';
import type { TransactionState, TransactionStatus } from '@/lib/utils';

export function useTransaction() {
  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    message: '',
  });

  const setStatus = useCallback((status: TransactionStatus, message: string, extra?: Partial<TransactionState>) => {
    setTxState({ status, message, ...extra });
  }, []);

  const reset = useCallback(() => {
    setTxState({ status: 'idle', message: '' });
  }, []);

  return { txState, setStatus, reset };
}
