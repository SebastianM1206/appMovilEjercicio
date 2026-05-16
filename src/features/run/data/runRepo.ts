export type RunRecord = {
  id: string;
  startedAt: number;
  durationSec: number;
  distanceMeters: number;
};

export interface RunRepo {
  saveRun(run: RunRecord): Promise<void>;
  listRuns(): Promise<RunRecord[]>;
}

export const createInMemoryRunRepo = (): RunRepo => {
  const runs: RunRecord[] = [];

  return {
    async saveRun(run: RunRecord) {
      runs.push(run);
    },
    async listRuns() {
      return [...runs];
    }
  };
};
