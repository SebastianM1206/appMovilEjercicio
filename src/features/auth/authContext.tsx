import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type AuthUser } from './authService';

export type AuthState = 'checking' | 'signedOut' | 'signedIn';

export type AuthContextValue = {
  state: AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>('checking');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setState(nextUser ? 'signedIn' : 'signedOut');
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      user,
      isAuthenticated: state === 'signedIn',
      signInWithEmail: authService.signInWithEmail,
      signUpWithEmail: authService.signUpWithEmail,
      signOut: authService.signOut,
    }),
    [state, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthContextInstance = AuthContext;
