import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import AppLayout from '../../../ui/layouts/AppLayout';
import { env } from '../../../app/env';
import { useHistory } from '../hooks/useHistory';
import { useRunMedia } from '../../run/hooks/useRunMedia';
import { useSyncQueue } from '../../sync/syncContext';
import Chip from '../../../ui/components/Chip';
import EmptyState from '../../../ui/components/EmptyState';
import Icon from '../../../ui/components/Icon';
import IconButton from '../../../ui/components/IconButton';
import { MiniRoute } from '../../../ui/components/MapRoute';
import SyncBadge, { type SyncState } from '../../../ui/components/SyncBadge';
import type { RunSession } from '../../../shared/types';

type RangeKey = 'all' | 'week' | 'month';

const RANGE_OPTIONS: { id: RangeKey; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const formatDate = (ts: number) =>
  new Intl.DateTimeFormat('es', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(ts))
    .replace(/\./g, '');

const formatPace = (secPerKm?: number) => {
  if (!secPerKm || !Number.isFinite(secPerKm) || secPerKm <= 0) return "0'00\"";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${String(s).padStart(2, '0')}"`;
};

const formatDuration = (s?: number) => {
  if (!s || s <= 0) return '0:00';
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`;
};

const titleFor = (run: RunSession) => {
  const hour = new Date(run.startedAt).getHours();
  if (hour < 12) return 'Trote matutino';
  if (hour < 18) return 'Corrida vespertina';
  return 'Corrida nocturna';
};

const syncStateOf = (run: RunSession): SyncState => {
  if (run.sync?.lastError) return 'error';
  if (run.sync?.summaryUploaded && run.sync?.routeUploaded && run.sync?.aggUpdated) return 'synced';
  return 'pending';
};

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const HistoryScreen = () => {
  const { items, isLoading, error, refresh } = useHistory();
  const { pendingCount, isSyncing, lastError, triggerSync } = useSyncQueue();
  const { isUploadingPhoto, lastUpload, error: photoError, uploadRunPhoto } = useRunMedia();
  const [range, setRange] = useState<RangeKey>('all');
  const [photoTarget, setPhotoTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cloudinaryEnabled = env.cloudinary.enabled;

  const filtered = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => {
      if (range === 'week') return now - item.startedAt <= WEEK_MS;
      if (range === 'month') return now - item.startedAt <= MONTH_MS;
      return true;
    });
  }, [items, range]);

  const monthSummary = useMemo(() => {
    const now = Date.now();
    const thisMonth = items.filter((item) => now - item.startedAt <= MONTH_MS);
    const totalKm = thisMonth.reduce((acc, r) => acc + (r.totals?.distanceM ?? 0), 0) / 1000;
    const totalSec = thisMonth.reduce((acc, r) => acc + (r.totals?.durationS ?? 0), 0);
    const totalKmAll = thisMonth.reduce((acc, r) => acc + (r.totals?.distanceM ?? 0), 0);
    const pace = totalKmAll > 0 ? totalSec / (totalKmAll / 1000) : 0;
    return {
      km: totalKm.toFixed(1),
      runs: thisMonth.length,
      pace: formatPace(pace),
    };
  }, [items]);

  const handlePickPhoto = (runId: string) => {
    // Si Cloudinary esta apagado, ni intentamos subir fotos. Luego le falseamos al cliente 
    if (!cloudinaryEnabled) {
      return;
    }
    if (!UUID_V4.test(runId)) return;
    setPhotoTarget(runId);
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const target = photoTarget;
    event.target.value = '';
    if (!file || !target) return;
    await uploadRunPhoto(target, file);
    await refresh();
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <h1
            className="font-display font-bold"
            style={{ fontSize: 26, letterSpacing: -0.5 }}
          >
            Historial
          </h1>
          <div
            className="font-body font-semibold mt-0.5"
            style={{ fontSize: 13, color: 'var(--stride-ink-3)' }}
          >
            {items.length} corridas guardadas
          </div>
        </div>
        <IconButton icon="filter" ariaLabel="Filtros" variant="outline" />
      </div>

      {/* Month summary */}
      <div className="mx-4 mt-3 rounded-[20px] bg-white p-5 shadow-stride flex justify-between">
        {[
          { v: `${monthSummary.km}`, l: 'km este mes' },
          { v: `${monthSummary.runs}`, l: 'corridas' },
          { v: monthSummary.pace, l: 'ritmo medio' },
        ].map((s, i) => (
          <div
            key={s.l}
            className={
              i === 1 ? 'text-center' : i === 2 ? 'text-right' : 'text-left'
            }
          >
            <div className="stride-num font-bold" style={{ fontSize: 22 }}>
              {s.v}
            </div>
            <div
              className="font-body font-semibold mt-1"
              style={{ fontSize: 11.5, color: 'var(--stride-ink-3)' }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Sync status row */}
      <div className="mx-4 mt-3 flex items-center gap-2.5 rounded-[14px] bg-white px-3.5 py-2.5 shadow-stride">
        <SyncBadge state={lastError ? 'error' : isSyncing ? 'syncing' : pendingCount > 0 ? 'pending' : 'synced'} />
        <span
          className="font-body font-semibold flex-1 truncate"
          style={{ fontSize: 12.5, color: 'var(--stride-ink-3)' }}
        >
          {lastError ?? (pendingCount > 0 ? `${pendingCount} ops en cola` : 'Todo al día')}
        </span>
        <button
          type="button"
          onClick={() => void triggerSync()}
          className="font-body font-bold"
          style={{ fontSize: 13, color: 'var(--stride-accent)' }}
        >
          Sincronizar
        </button>
      </div>

      {/* Range filters */}
      <div className="flex gap-2 overflow-x-auto pt-4 pb-1 px-4">
        {RANGE_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            active={range === opt.id}
            onClick={() => setRange(opt.id)}
          >
            {opt.label}
          </Chip>
        ))}
      </div>

      {/* Hidden input */}
      {/* Este input es el que  manda fotos a Cloudinary. */}
      {cloudinaryEnabled && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => void handlePhotoSelected(event)}
        />
      )}

      {/* List */}
      <div className="px-4 pt-2 flex flex-col gap-3">
        {isLoading && (
          <div className="stride-skeleton h-[88px] rounded-[18px]" aria-hidden="true" />
        )}
        {error && (
          <div
            className="rounded-2xl px-4 py-3 font-body font-semibold"
            role="alert"
            style={{
              background: 'var(--stride-danger-soft)',
              color: 'var(--stride-danger)',
              fontSize: 13.5,
            }}
          >
            {error}
          </div>
        )}
        {!isLoading && filtered.length === 0 && !error && (
          <EmptyState
            title="Aún no hay corridas"
            description="Apenas termines tu primera corrida la verás acá, incluso si arrancaste sin señal."
          />
        )}
        {filtered.map((run, idx) => {
          const distance = (run.totals?.distanceM ?? 0) / 1000;
          const syncState = syncStateOf(run);
          return (
            <div
              key={run.id}
              className="bg-white rounded-[18px] p-4 shadow-stride flex items-start gap-3.5"
            >
              <span className="grid place-items-center w-[52px] h-[52px] rounded-[14px] bg-stride-subtle shrink-0">
                <MiniRoute seed={idx} />
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="font-body font-bold uppercase"
                  style={{ fontSize: 11.5, color: 'var(--stride-ink-3)', letterSpacing: 0.6 }}
                >
                  {formatDate(run.startedAt)}
                </div>
                <div
                  className="font-body font-bold mt-0.5 mb-1.5"
                  style={{ fontSize: 15.5 }}
                >
                  {titleFor(run)}
                </div>
                <div className="flex gap-3 stride-num">
                  <span className="font-bold" style={{ fontSize: 14 }}>
                    {distance.toFixed(2)}
                    <span
                      className="font-body font-semibold"
                      style={{ fontSize: 11, color: 'var(--stride-ink-3)' }}
                    >
                      {' '}
                      km
                    </span>
                  </span>
                  <span className="font-bold" style={{ fontSize: 14, color: 'var(--stride-ink-2)' }}>
                    {formatDuration(run.totals?.durationS)}
                  </span>
                  <span className="font-bold" style={{ fontSize: 14, color: 'var(--stride-ink-2)' }}>
                    {formatPace(run.totals?.avgPaceSPerKm)}
                    <span
                      className="font-body font-semibold"
                      style={{ fontSize: 11, color: 'var(--stride-ink-3)' }}
                    >
                      {' '}
                      /km
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {syncState !== 'synced' && <SyncBadge state={syncState} />}
                  {cloudinaryEnabled ? (
                    <button
                      type="button"
                      onClick={() => handlePickPhoto(run.id)}
                      disabled={isUploadingPhoto}
                      className="inline-flex items-center gap-1.5 font-body font-bold"
                      style={{ fontSize: 12.5, color: 'var(--stride-accent)' }}
                    >
                      <Icon name="camera" size={14} strokeWidth={2.2} />
                      Foto
                    </button>
                  ) : (
                    <span
                      className="font-body font-semibold"
                      style={{ fontSize: 12.5, color: 'var(--stride-ink-3)' }}
                    >
                      Fotos deshabilitadas · Cloudinary no configurado
                    </span>
                  )}
                </div>
              </div>
              <Icon name="chevR" size={18} color="var(--stride-ink-3)" strokeWidth={2.2} />
            </div>
          );
        })}
      </div>

      {photoError && (
        <div className="mx-4 mt-4">
          <div
            className="rounded-2xl px-4 py-3 font-body font-semibold"
            role="alert"
            style={{
              background: 'var(--stride-danger-soft)',
              color: 'var(--stride-danger)',
              fontSize: 13.5,
            }}
          >
            {photoError}
          </div>
        </div>
      )}
      {lastUpload && (
        <div className="mx-4 mt-4">
          <div
            className="rounded-2xl px-4 py-3 font-body font-semibold"
            role="status"
            style={{
              background: 'var(--stride-success-soft)',
              color: '#0E7A4F',
              fontSize: 13.5,
            }}
          >
            Foto subida · ahora hay {lastUpload.photoCount} en la corrida.
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default HistoryScreen;
