import { firebaseAuth, type AuthSession } from '../../data/firebase/auth';
import {
  validateSignInInput,
  validateSignUpInput,
} from '../../data/firebase/authValidation';
import { userPublicRepo } from '../../data/firebase/userPublicRepo';
import { getErrorMessage } from '../../shared/utils';

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

const resolveDisplayName = (session: AuthSession): string => {
  const trimmed = session.displayName?.trim();
  if (trimmed) {
    return trimmed;
  }
  if (session.email) {
    return session.email.split('@')[0] ?? 'Usuario';
  }
  return 'Usuario';
};

const syncPublicProfile = async (session: AuthSession, isNewUser: boolean): Promise<void> => {
  const displayName = resolveDisplayName(session);
  if (isNewUser) {
    await userPublicRepo.createPublicProfile(session.uid, displayName);
    return;
  }
  await userPublicRepo.ensurePublicProfile(session.uid, displayName);
};

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const validation = validateSignInInput(email, password);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const session = await firebaseAuth.signInWithEmail(email.trim(), password);
      await syncPublicProfile(session, false);
      return mapSessionToUser(session);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo iniciar sesion.'));
    }
  },

  async signUpWithEmail(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthUser> {
    const validation = validateSignUpInput(email, password, displayName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const session = await firebaseAuth.signUpWithEmail(
        email.trim(),
        password,
        displayName.trim(),
      );
      await syncPublicProfile(session, true);
      return mapSessionToUser(session);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo crear la cuenta.'));
    }
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
