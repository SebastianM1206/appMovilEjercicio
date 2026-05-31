export const firebasePaths = {
  usersRoot: 'users',
  runsRoot: 'runs',
  countedRoot: 'counted',
  aggRoot: 'agg',
  userPublic: (uid: string) => `users/${uid}/public`,
  runSummary: (uid: string, runId: string) => `runs/${uid}/${runId}/summary`,
  runRoute: (uid: string, runId: string) => `runs/${uid}/${runId}/route`,
  runPhotos: (uid: string, runId: string) => `runs/${uid}/${runId}/photos`,
  runPhoto: (uid: string, runId: string, photoId: string) =>
    `runs/${uid}/${runId}/photos/${photoId}`,
  counted: (uid: string, runId: string) => `counted/${uid}/${runId}`,
  agg: (periodKey: string, uid: string) => `agg/${periodKey}/${uid}`,
  aggPeriod: (periodKey: string) => `agg/${periodKey}`,
};
