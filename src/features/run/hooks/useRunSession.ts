export type RunStatus = 'idle' | 'recording' | 'paused' | 'finished';

export const useRunSession = () => {
  return { status: 'idle' as RunStatus };
};
