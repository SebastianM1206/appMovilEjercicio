export type Migration = {
  from: number;
  to: number;
  run: () => Promise<void>;
};

export const migrations: Migration[] = [];
