import type { FC, ReactNode } from 'react';

type AppProvidersProps = {
  children: ReactNode;
};

const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return <>{children}</>;
};

export default AppProviders;
