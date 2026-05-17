export type Id = string;
export type Timestamp = number;

export type RunSessionStatus = 'recording' | 'paused' | 'finished' | 'synced' | 'error';

export type OutboxType = 'UPLOAD_ROUTE' | 'WRITE_SUMMARY' | 'UPDATE_AGG';

export type RunTotals = {
  distanceM: number;
  durationS: number;
  avgPaceSPerKm?: number;
  calories?: number;
};

export type RunStats = {
  maxSpeedMps?: number;
  avgSpeedMps?: number;
  pointCount?: number;
  badPointCount?: number;
};

export type RunSyncFlags = {
  summaryUploaded?: boolean;
  routeUploaded?: boolean;
  aggUpdated?: boolean;
  lastError?: string;
};

export type RunSession = {
  id: Id;
  uid: Id;
  status: RunSessionStatus;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  totals: RunTotals;
  stats: RunStats;
  sync: RunSyncFlags;
};

export type RunPoint = {
  id?: number;
  sessionId: Id;
  ts: Timestamp;
  lat: number;
  lon: number;
  accuracyM?: number;
  altitudeM?: number;
  speedMps?: number;
  bearing?: number;
};

export type RunEventType = 'KM_SPLIT' | 'PAUSE' | 'RESUME' | 'MILESTONE' | 'WARNING';

export type RunEvent = {
  id?: number;
  sessionId: Id;
  ts: Timestamp;
  type: RunEventType;
  payload?: Record<string, unknown>;
};

export type OutboxOp = {
  id?: number;
  opId: Id;
  sessionId: Id;
  type: OutboxType;
  attempts: number;
  nextRetryAt: Timestamp;
  lastError?: string;
  createdAt: Timestamp;
};
