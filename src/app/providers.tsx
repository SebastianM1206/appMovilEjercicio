import type { FC, ReactNode } from 'react';
import { AuthProvider } from '../features/auth/authContext';

type AppProvidersProps = {
  children: ReactNode;
};

const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProviders;
