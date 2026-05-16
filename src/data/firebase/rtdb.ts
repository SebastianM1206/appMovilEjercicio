export const rtdb = {
  read: async <T>(path: string): Promise<T | null> => {
    void path;
    return null;
  },
  write: async <T>(path: string, value: T): Promise<void> => {
    void path;
    void value;
  }
};
