import { useEffect, type FC, type ReactNode } from 'react';
import { AuthProvider } from '../features/auth/authContext';
import { createSyncService } from '../features/sync/syncService';
import { createRunRepoDexie } from '../data/dexie/repos/runRepoDexie';

type AppProvidersProps = {
  children: ReactNode;
};

const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  useEffect(() => {
    const runRepo = createRunRepoDexie();
    const syncService = createSyncService({ runRepo });
    void syncService.start();
    return () => syncService.stop();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProviders;
