export const firebasePaths = {
  usersRoot: 'users',
  runsRoot: 'runs',
  countedRoot: 'counted',
  aggRoot: 'agg',
  routesRoot: 'routes',
  photosRoot: 'photos',
  avatarsRoot: 'avatars',
  userPublic: (uid: string) => `users/${uid}/public`,
  runSummary: (uid: string, runId: string) => `runs/${uid}/${runId}/summary`,
  counted: (uid: string, runId: string) => `counted/${uid}/${runId}`,
  agg: (periodKey: string, uid: string) => `agg/${periodKey}/${uid}`,
  routePath: (uid: string, runId: string) => `routes/${uid}/${runId}.json.gz`,
  photoPath: (uid: string, runId: string, photoId: string) =>
    `photos/${uid}/${runId}/${photoId}.jpg`,
  avatarPath: (uid: string) => `avatars/${uid}.jpg`,
};
