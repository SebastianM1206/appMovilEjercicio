import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OutboxOp, RunSession } from '../../shared/types';
import type { RunRepo } from '../run/data/runRepo';
import { getIsoWeekPeriodKey } from '../../shared/utils';
import { createSyncEngine } from './syncEngine';
import { FATAL_RETRY_AT } from './syncErrors';

const existsMock = vi.fn();
const uploadMock = vi.fn();
const serializeRouteBlobMock = vi.fn();
const writeMock = vi.fn();
const tryAcquireCountedLockMock = vi.fn();
const incrementWeeklyAggMock = vi.fn();
const hasRunSummaryMock = vi.fn();

vi.mock('../../data/firebase/runAggRepo', () => ({
  runAggRepo: {
    tryAcquireCountedLock: (...args: unknown[]) => tryAcquireCountedLockMock(...args),
    incrementWeeklyAgg: (...args: unknown[]) => incrementWeeklyAggMock(...args),
    hasRunSummary: (...args: unknown[]) => hasRunSummaryMock(...args),
  },
}));

vi.mock('../../data/firebase/storage', () => ({
  GZIP_CONTENT_TYPE: 'application/gzip',
  serializeRouteBlob: (...args: unknown[]) => serializeRouteBlobMock(...args),
  storage: {
    exists: (...args: unknown[]) => existsMock(...args),
    upload: (...args: unknown[]) => uploadMock(...args),
  },
}));

vi.mock('../../data/firebase/rtdb', () => ({
  rtdb: {
    write: (...args: unknown[]) => writeMock(...args),
    transaction: vi.fn(),
  },
}));

const buildSession = (overrides: Partial<RunSession> = {}): RunSession => ({
  id: 'run-1',
  uid: 'user-1',
  status: 'finished',
  startedAt: 1716892800000,
  endedAt: 1716896400000,
  totals: {
    distanceM: 5000,
    durationS: 3600,
    avgPaceSPerKm: 720,
  },
  stats: {
    pointCount: 100,
    maxSpeedMps: 4,
  },
  sync: {},
  ...overrides,
});

const buildOutboxOp = (type: OutboxOp['type']): OutboxOp => ({
  opId: `op-${type}`,
  sessionId: 'run-1',
  type,
  attempts: 0,
  nextRetryAt: Date.now(),
  createdAt: Date.now(),
});

const createMockRunRepo = (): RunRepo => ({
  saveRun: vi.fn(),
  listRuns: vi.fn(),
  createSession: vi.fn(),
  updateSessionTotals: vi.fn(),
  updateSession: vi.fn(),
  getSession: vi.fn(),
  listSessions: vi.fn(),
  appendPointsBatch: vi.fn(),
  getPoints: vi.fn(),
  addEvent: vi.fn(),
  enqueueOutbox: vi.fn(),
  listPendingOutbox: vi.fn(),
  countOutbox: vi.fn(),
  markOutboxDone: vi.fn(),
  markOutboxFailed: vi.fn(),
});

describe('createSyncEngine', () => {
  let runRepo: RunRepo;

  beforeEach(() => {
    runRepo = createMockRunRepo();
    existsMock.mockReset();
    uploadMock.mockReset();
    serializeRouteBlobMock.mockReset();
    writeMock.mockReset();
    tryAcquireCountedLockMock.mockReset();
    incrementWeeklyAggMock.mockReset();
    hasRunSummaryMock.mockReset();
    serializeRouteBlobMock.mockResolvedValue(new Blob(['gzip'], { type: 'application/gzip' }));
    hasRunSummaryMock.mockResolvedValue(true);
    tryAcquireCountedLockMock.mockResolvedValue('locked_new');
    incrementWeeklyAggMock.mockResolvedValue({
      distanceM: 5000,
      runCount: 1,
      score: 5000,
      updatedAt: Date.now(),
      lastRunId: 'run-1',
    });
  });

  it('uploads gzip route when file does not exist', async () => {
    const session = buildSession();
    vi.mocked(runRepo.listPendingOutbox).mockResolvedValue([buildOutboxOp('UPLOAD_ROUTE')]);
    vi.mocked(runRepo.getSession).mockResolvedValue(session);
    existsMock.mockResolvedValue(false);
    vi.mocked(runRepo.getPoints).mockResolvedValue([
      { sessionId: 'run-1', ts: 1, lat: 19.43, lon: -99.13 },
      { sessionId: 'run-1', ts: 2, lat: 19.44, lon: -99.12 },
    ]);

    const engine = createSyncEngine({ runRepo, uid: 'user-1' });
    await engine.processOutbox();

    expect(serializeRouteBlobMock).toHaveBeenCalledOnce();
    expect(uploadMock).toHaveBeenCalledWith(
      'routes/user-1/run-1.json.gz',
      expect.any(Blob),
      'application/gzip',
    );
    expect(runRepo.markOutboxDone).toHaveBeenCalledWith('op-UPLOAD_ROUTE');
  });

  it('skips upload when route already exists', async () => {
    const session = buildSession();
    vi.mocked(runRepo.listPendingOutbox).mockResolvedValue([buildOutboxOp('UPLOAD_ROUTE')]);
    vi.mocked(runRepo.getSession).mockResolvedValue(session);
    existsMock.mockResolvedValue(true);

    const engine = createSyncEngine({ runRepo, uid: 'user-1' });
    await engine.processOutbox();

    expect(serializeRouteBlobMock).not.toHaveBeenCalled();
    expect(uploadMock).not.toHaveBeenCalled();
    expect(runRepo.markOutboxDone).toHaveBeenCalledWith('op-UPLOAD_ROUTE');
  });

  it('marks fatal error when points are insufficient', async () => {
    const session = buildSession();
    vi.mocked(runRepo.listPendingOutbox).mockResolvedValue([buildOutboxOp('UPLOAD_ROUTE')]);
    vi.mocked(runRepo.getSession).mockResolvedValue(session);
    existsMock.mockResolvedValue(false);
    vi.mocked(runRepo.getPoints).mockResolvedValue([
      { sessionId: 'run-1', ts: 1, lat: 19.43, lon: -99.13 },
    ]);

    const engine = createSyncEngine({ runRepo, uid: 'user-1' });
    await engine.processOutbox();

    expect(runRepo.updateSession).toHaveBeenCalledWith('run-1', {
      status: 'error',
      sync: { lastError: expect.stringContaining('Datos GPS insuficientes') },
    });
    expect(runRepo.markOutboxFailed).toHaveBeenCalledWith(
      'op-UPLOAD_ROUTE',
      expect.any(String),
      FATAL_RETRY_AT,
    );
  });

  it('writes summary with integrity flags and metadata', async () => {
    const session = buildSession();
    vi.mocked(runRepo.listPendingOutbox).mockResolvedValue([buildOutboxOp('WRITE_SUMMARY')]);
    vi.mocked(runRepo.getSession).mockResolvedValue(session);

    const engine = createSyncEngine({
      runRepo,
      uid: 'user-1',
      getMetadata: async () => ({ appVersion: '1.0.0', deviceModel: 'Pixel 7' }),
    });
    await engine.processOutbox();

    expect(writeMock).toHaveBeenCalledWith('runs/user-1/run-1/summary', {
      startedAt: session.startedAt,
      endedAt: session.endedAt ?? null,
      durationS: session.totals.durationS,
      distanceM: session.totals.distanceM,
      avgPaceSPerKm: session.totals.avgPaceSPerKm ?? null,
      calories: null,
      routePath: 'routes/user-1/run-1.json.gz',
      photoCount: 0,
      integrityFlags: ['OK'],
      appVersion: '1.0.0',
      deviceModel: 'Pixel 7',
    });
    expect(runRepo.markOutboxDone).toHaveBeenCalledWith('op-WRITE_SUMMARY');
  });

  it('rejects summary sync for too short distance', async () => {
    const session = buildSession({
      totals: { distanceM: 10, durationS: 120 },
      stats: { pointCount: 10 },
    });
    vi.mocked(runRepo.listPendingOutbox).mockResolvedValue([buildOutboxOp('WRITE_SUMMARY')]);
    vi.mocked(runRepo.getSession).mockResolvedValue(session);

    const engine = createSyncEngine({ runRepo, uid: 'user-1' });
    await engine.processOutbox();

    expect(writeMock).not.toHaveBeenCalled();
    expect(runRepo.markOutboxFailed).toHaveBeenCalledWith(
      'op-WRITE_SUMMARY',
      expect.stringContaining('DISTANCE_TOO_SHORT'),
      FATAL_RETRY_AT,
    );
  });

  it('increments weekly agg when counted lock is acquired', async () => {
    const session = buildSession({ sync: { summaryUploaded: true } });
    vi.mocked(runRepo.listPendingOutbox).mockResolvedValue([buildOutboxOp('UPDATE_AGG')]);
    vi.mocked(runRepo.getSession).mockResolvedValue(session);

    const engine = createSyncEngine({ runRepo, uid: 'user-1' });
    await engine.processOutbox();

    expect(incrementWeeklyAggMock).toHaveBeenCalledWith(
      'user-1',
      getIsoWeekPeriodKey(session.startedAt),
      'run-1',
      5000,
    );
    expect(runRepo.updateSession).toHaveBeenCalledWith('run-1', {
      sync: { summaryUploaded: true, aggUpdated: true },
      status: 'synced',
    });
    expect(runRepo.markOutboxDone).toHaveBeenCalledWith('op-UPDATE_AGG');
  });

  it('skips agg increment when run was already counted', async () => {
    const session = buildSession({ sync: { summaryUploaded: true } });
    tryAcquireCountedLockMock.mockResolvedValueOnce('already_counted');
    vi.mocked(runRepo.listPendingOutbox).mockResolvedValue([buildOutboxOp('UPDATE_AGG')]);
    vi.mocked(runRepo.getSession).mockResolvedValue(session);

    const engine = createSyncEngine({ runRepo, uid: 'user-1' });
    await engine.processOutbox();

    expect(incrementWeeklyAggMock).not.toHaveBeenCalled();
    expect(runRepo.updateSession).toHaveBeenCalledWith('run-1', {
      sync: { summaryUploaded: true, aggUpdated: true },
      status: 'synced',
    });
  });

  it('retries update agg when summary is not ready', async () => {
    const session = buildSession();
    hasRunSummaryMock.mockResolvedValueOnce(false);
    vi.mocked(runRepo.listPendingOutbox).mockResolvedValue([buildOutboxOp('UPDATE_AGG')]);
    vi.mocked(runRepo.getSession).mockResolvedValue(session);

    const engine = createSyncEngine({ runRepo, uid: 'user-1' });
    await engine.processOutbox();

    expect(incrementWeeklyAggMock).not.toHaveBeenCalled();
    expect(runRepo.markOutboxFailed).toHaveBeenCalledWith(
      'op-UPDATE_AGG',
      expect.stringContaining('resumen de la carrera'),
      expect.any(Number),
    );
    const retryAt = vi.mocked(runRepo.markOutboxFailed).mock.calls[0]?.[2];
    expect(retryAt).not.toBe(FATAL_RETRY_AT);
  });
});
