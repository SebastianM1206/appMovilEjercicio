export type LeaderboardRow = {
  id: string;
  displayName: string;
  score: number;
};

export const useLeaderboard = () => {
  return { rows: [] as LeaderboardRow[] };
};
