import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRunRepoDexie } from '../../../data/dexie/repos/runRepoDexie';
import { useAuth } from '../../auth/hooks/useAuth';
import { getErrorMessage } from '../../../shared/utils';
import type { RunSession } from '../../../shared/types';

export type HistoryState = {
  items: RunSession[];
  isLoading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

export const useHistory = (limit = 50): HistoryState => {
  const { user } = useAuth();
  const repo = useMemo(() => createRunRepoDexie(), []);
  const [items, setItems] = useState<RunSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    setError(undefined);
    try {
      const rows = await repo.listSessions(user.id, limit);
      setItems(rows.sort((a, b) => b.startedAt - a.startedAt));
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'No se pudo leer el historial.'));
    } finally {
      setIsLoading(false);
    }
  }, [limit, repo, user]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    isLoading,
    error,
    refresh: load,
  };
};
