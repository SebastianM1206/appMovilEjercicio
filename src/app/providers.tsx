import { useEffect, useMemo, type FC, type ReactNode } from 'react';
import { AuthProvider } from '../features/auth/authContext';
import { SyncProvider } from '../features/sync/syncContext';
import { createRunRepoDexie } from '../data/dexie/repos/runRepoDexie';

type AppProvidersProps = {
  children: ReactNode;
};

const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  const runRepo = useMemo(() => createRunRepoDexie(), []);

  return (
    <AuthProvider>
      <SyncProvider runRepo={runRepo}>{children}</SyncProvider>
    </AuthProvider>
  );
};

export default AppProviders;
