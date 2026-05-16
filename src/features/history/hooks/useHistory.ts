export type HistoryItem = {
  id: string;
  label: string;
};

export const useHistory = () => {
  return { items: [] as HistoryItem[] };
};
