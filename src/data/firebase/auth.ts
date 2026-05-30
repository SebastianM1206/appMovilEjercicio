import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getFirebaseApp } from './app';

export type AuthSession = {
  uid: string;
  email?: string;
  displayName?: string | null;
};

const mapUserToSession = (user: User): AuthSession => ({
  uid: user.uid,
  email: user.email ?? undefined,
  displayName: user.displayName ?? null,
});

export const firebaseAuth = {
  getClient() {
    return getAuth(getFirebaseApp());
  },
  currentSession(): AuthSession | null {
    const user = firebaseAuth.getClient().currentUser;
    return user ? mapUserToSession(user) : null;
  },
  async signInWithEmail(email: string, password: string): Promise<AuthSession> {
    const credential = await signInWithEmailAndPassword(firebaseAuth.getClient(), email, password);
    return mapUserToSession(credential.user);
  },
  async signUpWithEmail(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthSession> {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth.getClient(),
      email,
      password,
    );
    await updateProfile(credential.user, { displayName: displayName.trim() });
    return mapUserToSession({
      ...credential.user,
      displayName: displayName.trim(),
    });
  },
  async signOut(): Promise<void> {
    await firebaseSignOut(firebaseAuth.getClient());
  },
  onSessionChanged(onChange: (session: AuthSession | null) => void) {
    return onAuthStateChanged(firebaseAuth.getClient(), (user) => {
      onChange(user ? mapUserToSession(user) : null);
    });
  },
};
