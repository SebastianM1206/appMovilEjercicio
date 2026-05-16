export const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

export const getIsoWeekPeriodKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const week = `${weekNo}`.padStart(2, '0');
  return `${date.getUTCFullYear()}-${week}`;
};
