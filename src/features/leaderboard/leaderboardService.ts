export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  score: number;
};

export const leaderboardService = {
  async getTop(limit: number): Promise<LeaderboardEntry[]> {
    const size = Math.max(0, limit);
    return Array.from({ length: size }, (_, index) => ({
      userId: `user-${index + 1}`,
      displayName: `Corredor ${index + 1}`,
      score: 0,
    }));
  },
};
