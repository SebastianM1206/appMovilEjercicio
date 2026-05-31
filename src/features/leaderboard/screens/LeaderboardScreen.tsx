import { useMemo } from 'react';
import AppLayout from '../../../ui/layouts/AppLayout';
import EmptyState from '../../../ui/components/EmptyState';
import Icon from '../../../ui/components/Icon';
import Chip from '../../../ui/components/Chip';
import { useLeaderboard, type LeaderboardRow } from '../hooks/useLeaderboard';
import { useAuth } from '../../auth/hooks/useAuth';
import { getIsoWeekPeriodKey } from '../../../shared/utils';

const formatKm = (m: number) => (m / 1000).toFixed(1);
const initials = (name: string) =>
  name
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

const LeaderboardScreen = () => {
  const { user } = useAuth();
  const periodKey = useMemo(() => getIsoWeekPeriodKey(Date.now()), []);
  const { rows, myEntry, isLoading, error } = useLeaderboard(periodKey);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  // Lo pongo asi para que el 1er puesto quede en el centro y se vea ricp
  const order = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = [96, 72, 58];

  const renderPodium = (idx: number) => {
    const row = podium[idx];
    if (!row) {
      return (
        <div
          key={idx}
          className="flex-1 flex flex-col items-center justify-end opacity-40"
          aria-hidden="true"
        >
          <span
            className="grid place-items-center text-white font-display font-bold"
            style={{
              width: idx === 0 ? 60 : 48,
              height: idx === 0 ? 60 : 48,
              borderRadius: 99,
              fontSize: idx === 0 ? 22 : 17,
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            —
          </span>
          <div
            className="w-full mt-2 rounded-t-[10px] grid place-items-start justify-center pt-2"
            style={{
              height: heights[idx],
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <span
              className="font-display font-bold"
              style={{ fontSize: 26, color: 'rgba(255,255,255,0.3)' }}
            >
              {idx + 1}
            </span>
          </div>
        </div>
      );
    }
    const first = idx === 0;
    return (
      <div key={row.id} className="flex-1 z-10 flex flex-col items-center">
        {first && (
          <Icon name="trophy" size={22} color="var(--stride-accent)" strokeWidth={2} />
        )}
        <span
          className="grid place-items-center text-white font-display font-bold mt-1.5"
          style={{
            width: first ? 60 : 48,
            height: first ? 60 : 48,
            borderRadius: 99,
            fontSize: first ? 22 : 17,
            background: 'linear-gradient(135deg,#FFB8A8,#FF4D2E)',
            border: `3px solid ${first ? 'var(--stride-accent)' : 'rgba(255,255,255,0.2)'}`,
          }}
        >
          {initials(row.displayName)}
        </span>
        <span className="font-body font-bold text-white mt-2" style={{ fontSize: 13 }}>
          {row.displayName.split(' ')[0]}
        </span>
        <span
          className="stride-num font-bold"
          style={{ fontSize: 15, color: 'var(--stride-accent)' }}
        >
          {formatKm(row.distanceM)} km
        </span>
        <div
          className="w-full mt-2 rounded-t-[10px] grid place-items-start justify-center pt-2"
          style={{
            height: heights[idx],
            background: first ? 'rgba(255,77,46,0.18)' : 'rgba(255,255,255,0.08)',
          }}
        >
          <span
            className="font-display font-bold"
            style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)' }}
          >
            {idx + 1}
          </span>
        </div>
      </div>
    );
  };

  const renderRow = (row: LeaderboardRow, position: number) => {
    const me = row.id === user?.id;
    return (
      <div
        key={row.id}
        className="flex items-center gap-3 rounded-[16px] px-4 py-3"
        style={{
          background: me ? 'var(--stride-ink)' : '#fff',
          boxShadow: me ? '0 8px 24px rgba(14,17,22,0.18)' : 'var(--shadow-stride)',
        }}
      >
        <span
          className="font-display font-bold"
          style={{
            width: 22,
            fontSize: 16,
            color: me ? 'var(--stride-accent)' : 'var(--stride-ink-3)',
          }}
        >
          {position}
        </span>
        <span
          className="grid place-items-center text-white font-display font-bold"
          style={{
            width: 38,
            height: 38,
            borderRadius: 99,
            fontSize: 15,
            background: me
              ? 'linear-gradient(135deg,#FFB8A8,#FF4D2E)'
              : 'var(--stride-bg-sunken)',
            color: me ? '#fff' : 'var(--stride-ink-2)',
          }}
        >
          {initials(row.displayName)}
        </span>
        <span
          className="flex-1 font-body font-bold"
          style={{ fontSize: 15, color: me ? '#fff' : 'var(--stride-ink)' }}
        >
          {me ? 'Vos' : row.displayName}
        </span>
        <span
          className="stride-num font-bold"
          style={{ fontSize: 16, color: me ? '#fff' : 'var(--stride-ink)' }}
        >
          {formatKm(row.distanceM)}
          <span
            className="font-body font-semibold"
            style={{
              fontSize: 11,
              color: me ? 'rgba(255,255,255,0.55)' : 'var(--stride-ink-3)',
              marginLeft: 2,
            }}
          >
            km
          </span>
        </span>
      </div>
    );
  };

  const myPosition = useMemo(() => {
    if (!myEntry) return null;
    const found = rows.findIndex((r) => r.id === myEntry.id);
    return found >= 0 ? found + 1 : null;
  }, [myEntry, rows]);

  return (
    <AppLayout>
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <h1
            className="font-display font-bold"
            style={{ fontSize: 26, letterSpacing: -0.5 }}
          >
            Ranking
          </h1>
          <div
            className="font-body font-semibold mt-0.5"
            style={{ fontSize: 13, color: 'var(--stride-ink-3)' }}
          >
            Semana {periodKey}
          </div>
        </div>
        <Chip icon="globe" active>
          Comunidad
        </Chip>
      </div>

      {/* Podium */}
      <div
        className="relative overflow-hidden mx-4 mt-3 rounded-[24px] pt-5 px-4 flex items-end justify-center gap-3"
        style={{ background: 'var(--stride-ink)' }}
      >
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[220px] h-[140px]"
          style={{
            background:
              'radial-gradient(ellipse, rgba(255,77,46,0.3), transparent 70%)',
          }}
        />
        {order.map(renderPodium)}
      </div>

      {/* My entry banner */}
      {myEntry && (
        <div className="mx-4 mt-4">{renderRow(myEntry, myPosition ?? rows.length + 1)}</div>
      )}

      {/* Rest of list */}
      <div className="px-4 pt-3 flex flex-col gap-2.5">
        {isLoading && (
          <>
            <div className="stride-skeleton h-[60px] rounded-[16px]" aria-hidden="true" />
            <div className="stride-skeleton h-[60px] rounded-[16px]" aria-hidden="true" />
            <div className="stride-skeleton h-[60px] rounded-[16px]" aria-hidden="true" />
          </>
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
        {!isLoading && !error && rows.length === 0 && (
          <EmptyState
            icon="trophy"
            title="Aún no hay datos esta semana"
            description="Termina tu primera corrida y aparecerás en el ranking."
          />
        )}
        {rest.map((row, idx) => renderRow(row, idx + 4))}
      </div>
    </AppLayout>
  );
};

export default LeaderboardScreen;
