import type { ReactNode } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { IonSpinner } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';

type AuthGateProps = {
  children: ReactNode;
};

const AuthGate = ({ children }: AuthGateProps) => {
  const { state, isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthRoute = location.pathname === '/auth';

  if (state === 'checking') {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-label="Verificando sesion"
      >
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (!isAuthenticated && !isAuthRoute) {
    // Si no esta logueado, lo mando  pal auth.
    return <Redirect to="/auth" />;
  }

  if (isAuthenticated && isAuthRoute) {
    // si entró, adentro queda .
    return <Redirect to="/run" />;
  }

  return <>{children}</>;
};

export default AuthGate;
