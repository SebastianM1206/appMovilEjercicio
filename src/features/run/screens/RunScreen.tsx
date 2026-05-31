import { useMemo, useState } from 'react';
import AppLayout from '../../../ui/layouts/AppLayout';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSyncQueue } from '../../sync/syncContext';
import { useRunSession } from '../hooks/useRunSession';
import Chip from '../../../ui/components/Chip';
import StrideButton from '../../../ui/components/Button';
import Icon from '../../../ui/components/Icon';
import IconButton from '../../../ui/components/IconButton';
import MapRoute from '../../../ui/components/MapRoute';
import Metric from '../../../ui/components/Metric';
import SyncBadge from '../../../ui/components/SyncBadge';

const formatDuration = (s: number) => {
  const total = Math.max(0, Math.floor(s));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`;
};

const formatPace = (secPerKm: number) => {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return "0'00\"";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${String(s).padStart(2, '0')}"`;
};

const formatKm = (m: number) => (m / 1000).toFixed(2);

type RunType = 'free' | 'distance' | 'time';

const RunScreen = () => {
  const { user } = useAuth();
  const { isSyncing, pendingCount, lastError } = useSyncQueue();
  const run = useRunSession();
  const [runType, setRunType] = useState<RunType>('free');

  const firstName = useMemo(() => {
    if (!user) return 'corredor';
    if (user.displayName?.trim()) return user.displayName.trim().split(' ')[0];
    if (user.email) return user.email.split('@')[0];
    return 'corredor';
  }, [user]);

  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat('es', { weekday: 'long', day: '2-digit', month: 'short' })
      .format(new Date())
      .replace(/^\w/, (c) => c.toUpperCase());
  }, []);

  const initials = useMemo(() => {
    const source = user?.displayName?.trim() || user?.email || 'AP';
    return source
      .split(/[\s.@_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }, [user]);

  const liveProgress = useMemo(() => {
    // Esto es pa animar a que le meta más duro.
    if (run.status === 'idle' || run.status === 'finished') return 0;
    const km = run.distanceMeters / 1000;
    return Math.min(0.92, 0.1 + km * 0.18);
  }, [run.distanceMeters, run.status]);

  // ───────── Live view (recording / paused) ─────────
  if (run.status === 'recording' || run.status === 'paused') {
    const recording = run.status === 'recording';
    return (
      <AppLayout hideTabBar>
        <div className="relative">
          <MapRoute
            progress={liveProgress}
            height={300}
            pinColor={run.gpsReady ? 'var(--stride-success)' : 'var(--stride-warn)'}
            pinLabel={run.gpsReady ? 'GPS fuerte' : 'Buscando GPS…'}
          />
          <div
            className="absolute top-3 left-3 flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(14,17,22,0.82)' }}
          >
            <span
              className={recording ? 'stride-pulse' : ''}
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: recording ? 'var(--stride-accent)' : 'var(--stride-warn)',
                display: 'block',
              }}
            />
            <span className="font-body font-bold text-white" style={{ fontSize: 13 }}>
              {recording ? 'Grabando' : 'En pausa'}
            </span>
          </div>
        </div>

        {run.milestoneKm !== null && (
          <div className="grid place-items-center px-4 -mt-6 relative z-10 stride-slide-down">
            <div
              className="flex items-center gap-3 rounded-full pl-3.5 pr-5 py-3 text-white"
              style={{
                background: 'var(--stride-accent)',
                boxShadow: 'var(--shadow-stride-accent-lg)',
              }}
            >
              <span className="grid place-items-center w-9 h-9 rounded-full bg-white/20">
                <Icon name="zap" size={20} color="#fff" strokeWidth={2.4} />
              </span>
              <div>
                <div className="font-display font-bold leading-none" style={{ fontSize: 16 }}>
                  ¡Stride! Km {run.milestoneKm}
                </div>
                <div className="font-body font-semibold opacity-90 mt-0.5" style={{ fontSize: 12.5 }}>
                  Ritmo {formatPace(run.pacePerKmSec)} /km · seguí así
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 mt-6 text-center">
          <div
            className="font-body font-bold uppercase"
            style={{ fontSize: 13, color: 'var(--stride-ink-3)', letterSpacing: 1.5 }}
          >
            Distancia
          </div>
          <div
            className="stride-num font-bold mt-1"
            style={{ fontSize: 92, lineHeight: 0.92, color: 'var(--stride-ink)', letterSpacing: -3 }}
          >
            {formatKm(run.distanceMeters)}
            <span style={{ fontSize: 30, color: 'var(--stride-ink-3)', fontWeight: 600 }}> km</span>
          </div>
        </div>

        <div
          className="mx-6 mt-7 pt-6 flex justify-around"
          style={{ borderTop: '1px solid var(--stride-line)' }}
        >
          <Metric value={formatDuration(run.durationSec)} label="Tiempo" size={32} align="center" />
          <div style={{ width: 1, background: 'var(--stride-line)' }} />
          <Metric value={formatPace(run.pacePerKmSec)} label="Ritmo /km" size={32} align="center" />
          <div style={{ width: 1, background: 'var(--stride-line)' }} />
          <Metric
            value={(run.avgSpeed * 3.6).toFixed(1)}
            unit="km/h"
            label="Velocidad"
            size={32}
            align="center"
          />
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 mb-10">
          {recording ? (
            <>
              <button
                onClick={run.pause}
                aria-label="Pausar"
                className="grid place-items-center rounded-full"
                style={{
                  width: 88,
                  height: 88,
                  background: 'var(--stride-warn)',
                  boxShadow: 'var(--shadow-stride)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon name="pause" size={36} color="#fff" />
              </button>
              <IconButton
                icon="flag"
                ariaLabel="Marcar split"
                size={64}
                iconSize={26}
                variant="subtle"
                color="var(--stride-ink-2)"
              />
            </>
          ) : (
            <>
              <button
                onClick={() => void run.stop()}
                aria-label="Finalizar"
                className="grid place-items-center rounded-full"
                style={{
                  width: 64,
                  height: 64,
                  background: 'var(--stride-ink)',
                  boxShadow: 'var(--shadow-stride)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon name="stop" size={26} color="#fff" />
              </button>
              <button
                onClick={run.resume}
                aria-label="Reanudar"
                className="grid place-items-center rounded-full"
                style={{
                  width: 92,
                  height: 92,
                  background: 'var(--stride-accent)',
                  boxShadow: 'var(--shadow-stride-accent-lg)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon name="play" size={42} color="#fff" />
              </button>
              <IconButton
                icon="flag"
                ariaLabel="Marcar split"
                size={64}
                iconSize={26}
                variant="subtle"
                color="var(--stride-ink-2)"
              />
            </>
          )}
        </div>

        {run.error && (
          <div className="mx-6 mb-8">
            <div
              className="rounded-2xl px-4 py-3 font-body font-semibold"
              role="alert"
              style={{
                background: 'var(--stride-danger-soft)',
                color: 'var(--stride-danger)',
                fontSize: 13.5,
              }}
            >
              {run.error}
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  // ───────── Finished summary ─────────
  if (run.status === 'finished') {
    return (
      <AppLayout>
        <div className="flex items-center justify-between px-5 pt-4">
          <IconButton icon="x" ariaLabel="Cerrar resumen" onClick={run.reset} />
          <span className="font-body font-bold" style={{ fontSize: 16 }}>
            Resumen
          </span>
          <SyncBadge state={pendingCount > 0 ? 'pending' : isSyncing ? 'syncing' : 'synced'} />
        </div>

        <div className="px-5 pt-2">
          <span
            className="font-body font-bold uppercase"
            style={{ fontSize: 13, color: 'var(--stride-accent)', letterSpacing: 1.2 }}
          >
            Corrida registrada
          </span>
          <div className="flex items-end gap-2 mt-2">
            <span
              className="stride-num font-bold"
              style={{ fontSize: 64, lineHeight: 0.9, letterSpacing: -2 }}
            >
              {formatKm(run.distanceMeters)}
            </span>
            <span
              className="font-display font-semibold mb-2"
              style={{ fontSize: 24, color: 'var(--stride-ink-3)' }}
            >
              km
            </span>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-[22px] overflow-hidden shadow-stride border border-stride-line">
          <MapRoute progress={1} height={200} showPin={false} />
        </div>

        <div
          className="mx-4 mt-4 grid grid-cols-2 gap-5 rounded-[22px] bg-white p-5 shadow-stride"
        >
          <Metric
            value={formatDuration(run.durationSec)}
            label="Tiempo"
            size={24}
            align="left"
          />
          <Metric
            value={formatPace(run.pacePerKmSec)}
            label="Ritmo /km"
            size={24}
            align="left"
          />
          <Metric
            value={(run.avgSpeed * 3.6).toFixed(1)}
            unit="km/h"
            label="Velocidad media"
            size={24}
            align="left"
          />
          <Metric
            value={run.samples.length}
            label="Puntos GPS"
            size={24}
            align="left"
          />
        </div>

        <div className="px-5 mt-6 flex gap-3">
          <StrideButton kind="outline" icon="share" full size="md">
            Compartir
          </StrideButton>
          <StrideButton icon="check" full size="md" onClick={run.reset}>
            Listo
          </StrideButton>
        </div>
        {lastError && (
          <div className="mx-5 mt-4">
            <div
              className="rounded-2xl px-4 py-3 font-body font-semibold"
              role="status"
              style={{
                background: 'var(--stride-danger-soft)',
                color: 'var(--stride-danger)',
                fontSize: 13.5,
              }}
            >
              Sync: {lastError}
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  // ───────── Home / idle ─────────
  return (
    <AppLayout>
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <div
            className="font-body font-semibold"
            style={{ fontSize: 13.5, color: 'var(--stride-ink-3)' }}
          >
            {dateLabel}
          </div>
          <div
            className="font-display font-bold"
            style={{ fontSize: 24, letterSpacing: -0.5 }}
          >
            Hola, {firstName} 👋
          </div>
        </div>
        <span
          className="grid place-items-center text-white font-display font-bold"
          style={{
            width: 44,
            height: 44,
            borderRadius: 99,
            fontSize: 17,
            background: 'linear-gradient(135deg,#FFB8A8,#FF4D2E)',
          }}
        >
          {initials || 'ST'}
        </span>
      </div>

      <div
        className="mx-4 mt-3 flex items-center gap-2.5 rounded-[12px] px-3.5 py-2.5"
        style={{ background: 'var(--stride-success-soft)' }}
      >
        <Icon name="gps" size={18} color="var(--stride-success)" strokeWidth={2.2} />
        <span
          className="font-body font-semibold"
          style={{ fontSize: 13.5, color: '#0E7A4F' }}
        >
          {run.error ? 'GPS sin permisos · revisalo en ajustes' : 'GPS listo · señal fuerte'}
        </span>
        <span className="ml-auto flex gap-0.5 items-end">
          {[8, 12, 16, 20].map((h, i) => (
            <span
              key={i}
              style={{
                width: 3.5,
                height: h,
                borderRadius: 2,
                background: 'var(--stride-success)',
              }}
            />
          ))}
        </span>
      </div>

      {/* Sync banner if needed */}
      {(pendingCount > 0 || lastError || isSyncing) && (
        <div className="mx-4 mt-3 rounded-[14px] bg-white px-3.5 py-2.5 shadow-stride flex items-center gap-2.5">
          <SyncBadge
            state={lastError ? 'error' : isSyncing ? 'syncing' : 'pending'}
            label={
              lastError
                ? 'Error'
                : isSyncing
                  ? 'Sincronizando'
                  : `${pendingCount} pendientes`
            }
          />
          <span
            className="font-body font-semibold ml-auto"
            style={{ fontSize: 12.5, color: 'var(--stride-ink-3)' }}
          >
            {lastError ?? 'Se sube automáticamente al volver online'}
          </span>
        </div>
      )}

      {/* Hero start card */}
      <div
        className="relative overflow-hidden mx-4 mt-4 rounded-[28px] px-6 py-7"
        style={{ background: 'var(--stride-ink)' }}
      >
        <div
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,77,46,0.35), transparent 70%)',
          }}
        />
        <div className="relative">
          <div
            className="font-body font-bold uppercase"
            style={{
              fontSize: 13,
              letterSpacing: 1.4,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Listo para correr
          </div>
          <h2
            className="font-display font-bold mt-3"
            style={{
              fontSize: 32,
              color: '#fff',
              letterSpacing: -1,
              lineHeight: 1.05,
            }}
          >
            Tocá iniciar y<br />
            seguimos tus pasos
          </h2>
          <p
            className="font-body font-medium mt-3"
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}
          >
            Distancia, ritmo y ruta en tiempo real. Sin señal también: todo se guarda y sube solo.
          </p>
        </div>
      </div>

      <div className="grid place-items-center pt-6 pb-3">
        <button
          onClick={() => void run.start()}
          aria-label="Iniciar corrida"
          className="grid place-items-center relative"
          style={{
            width: 132,
            height: 132,
            borderRadius: 99,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--stride-accent)',
            boxShadow: 'var(--shadow-stride-accent-lg)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span
            className="absolute rounded-full"
            style={{
              inset: -8,
              border: '2px solid var(--stride-accent-soft)',
              opacity: 0.6,
            }}
          />
          <div className="flex flex-col items-center gap-0.5 text-white">
            <Icon name="play" size={40} color="#fff" />
            <span
              className="font-display font-bold mt-1"
              style={{ fontSize: 15, letterSpacing: 0.3 }}
            >
              INICIAR
            </span>
          </div>
        </button>
        <span
          className="font-body font-semibold mt-3"
          style={{ fontSize: 13.5, color: 'var(--stride-ink-3)' }}
        >
          Tocá para empezar a correr
        </span>
      </div>

      <div className="px-4 flex gap-2 flex-wrap mt-2">
        <Chip
          icon="route"
          active={runType === 'free'}
          onClick={() => setRunType('free')}
        >
          Libre
        </Chip>
        <Chip
          icon="target"
          active={runType === 'distance'}
          onClick={() => setRunType('distance')}
        >
          Meta de distancia
        </Chip>
        <Chip
          icon="clock"
          active={runType === 'time'}
          onClick={() => setRunType('time')}
        >
          Por tiempo
        </Chip>
      </div>

      {run.error && (
        <div className="mx-4 mt-5">
          <div
            className="rounded-2xl px-4 py-3 font-body font-semibold"
            role="alert"
            style={{
              background: 'var(--stride-danger-soft)',
              color: 'var(--stride-danger)',
              fontSize: 13.5,
            }}
          >
            {run.error}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default RunScreen;
