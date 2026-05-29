import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createSyncService, type SyncService } from './syncService';
import type { RunRepo } from '../run/data/runRepo';
import { useAuth } from '../auth/hooks/useAuth';

export type SyncQueueState = {
  isSyncing: boolean;
  pendingCount: number;
  lastError?: string;
  triggerSync: () => Promise<void>;
};

type SyncContextValue = SyncQueueState;

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

type SyncProviderProps = {
  children: ReactNode;
  runRepo: RunRepo;
};

export const SyncProvider = ({ children, runRepo }: SyncProviderProps) => {
  const { state: authState, isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastError, setLastError] = useState<string | undefined>();

  const syncService = useMemo(() => createSyncService({ runRepo }), [runRepo]);

  const refreshStats = useCallback(async () => {
    const [count, outboxOps] = await Promise.all([
      runRepo.countOutbox(),
      runRepo.listPendingOutbox(Number.MAX_SAFE_INTEGER),
    ]);

    setPendingCount(count);
    const latestWithError = [...outboxOps].reverse().find((item) => item.lastError);
    const latestError = latestWithError?.lastError;
    setLastError(latestError);
  }, [runRepo]);

  const triggerSync = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsSyncing(true);
    try {
      await syncService.process();
    } finally {
      setIsSyncing(false);
      await refreshStats();
    }
  }, [isAuthenticated, refreshStats, syncService]);

  useEffect(() => {
    if (authState === 'checking') {
      return;
    }

    if (!isAuthenticated) {
      syncService.stop();
      setIsSyncing(false);
      setPendingCount(0);
      setLastError(undefined);
      return;
    }

    void (async () => {
      await syncService.start();
      await refreshStats();
      setIsSyncing(true);
      try {
        await syncService.process();
      } finally {
        setIsSyncing(false);
        await refreshStats();
      }
    })();

    return () => {
      syncService.stop();
    };
  }, [authState, isAuthenticated, refreshStats, syncService]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshStats();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, refreshStats]);

  const value = useMemo<SyncContextValue>(
    () => ({
      isSyncing,
      pendingCount,
      lastError,
      triggerSync,
    }),
    [isSyncing, pendingCount, lastError, triggerSync],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSyncQueue = (): SyncQueueState => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncQueue must be used within a SyncProvider');
  }
  return context;
};

export type { SyncService };
