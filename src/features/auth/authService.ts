export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
};

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    void password;
    return { id: 'local-demo', email };
  },
  async signOut(): Promise<void> {
    return;
  }
};
