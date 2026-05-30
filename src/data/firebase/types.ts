export type UserPublic = {
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
  createdAt: number;
  updatedAt: number;
};

export type RunSummary = {
  startedAt: number;
  endedAt: number | null;
  durationS: number;
  distanceM: number;
  avgPaceSPerKm: number | null;
  calories: number | null;
  routePath: string;
  photoCount: number;
  integrityFlags: IntegrityFlag[];
  appVersion: string;
  deviceModel: string;
};

export type AggEntry = {
  distanceM: number;
  runCount: number;
  score: number;
  updatedAt: number;
  lastRunId: string;
};

export type RoutePoint = {
  ts: number;
  lat: number;
  lon: number;
  accuracyM?: number;
  altitudeM?: number;
  speedMps?: number;
  bearing?: number;
};

export type RouteBlob = {
  version: 1;
  runId: string;
  uid: string;
  pointCount: number;
  points: RoutePoint[];
};

export type IntegrityFlag =
  | 'OK'
  | 'DISTANCE_TOO_SHORT'
  | 'DISTANCE_TOO_LONG'
  | 'DURATION_TOO_LONG'
  | 'PACE_OUT_OF_RANGE'
  | 'INSUFFICIENT_POINTS'
  | 'SPEED_ANOMALY';
