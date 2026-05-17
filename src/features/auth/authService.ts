import { firebaseAuth, type AuthSession } from '../../data/firebase/auth';

export type AuthUser = {
  id: string;
  email?: string;
  displayName?: string | null;
};

const mapSessionToUser = (session: AuthSession): AuthUser => ({
  id: session.uid,
  email: session.email,
  displayName: session.displayName,
});

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const session = await firebaseAuth.signInWithEmail(email, password);
    return mapSessionToUser(session);
  },
  async signOut(): Promise<void> {
    await firebaseAuth.signOut();
  },
  onAuthStateChanged(onChange: (user: AuthUser | null) => void) {
    return firebaseAuth.onSessionChanged((session) => {
      onChange(session ? mapSessionToUser(session) : null);
    });
  },
  currentUser(): AuthUser | null {
    const session = firebaseAuth.currentSession();
    return session ? mapSessionToUser(session) : null;
  },
};
