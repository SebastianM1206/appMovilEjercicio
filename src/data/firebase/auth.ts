export type AuthSession = {
  uid: string;
  email?: string;
};

export const firebaseAuth = {
  currentSession(): AuthSession | null {
    return null;
  }
};
