export const storage = {
  upload: async (path: string, data: Blob): Promise<string> => {
    void data;
    return path;
  }
};
