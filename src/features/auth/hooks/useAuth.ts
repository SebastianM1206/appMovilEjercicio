export type AuthState = 'idle' | 'checking' | 'signedOut' | 'signedIn';

export const useAuth = () => {
  return { state: 'idle' as AuthState };
};
