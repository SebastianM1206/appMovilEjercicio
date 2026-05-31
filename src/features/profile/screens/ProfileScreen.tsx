import { useMemo, useRef, type ChangeEvent } from 'react';
import AppLayout from '../../../ui/layouts/AppLayout';
import { env } from '../../../app/env';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useHistory } from '../../history/hooks/useHistory';
import StrideButton from '../../../ui/components/Button';
import Icon from '../../../ui/components/Icon';
import IconButton from '../../../ui/components/IconButton';

const ACHIEVEMENT_CARDS: {
  icon: 'medal' | 'flame' | 'zap' | 'trophy';
  label: string;
  color: string;
}[] = [
  { icon: 'medal', label: '5K', color: 'var(--stride-accent)' },
  { icon: 'flame', label: 'Racha', color: 'var(--stride-warn)' },
  { icon: 'zap', label: 'Récord', color: 'var(--stride-info)' },
  { icon: 'trophy', label: 'Top 5', color: 'var(--stride-success)' },
];

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading, error, uploadAvatar } = useProfile();
  const { items } = useHistory();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cloudinaryEnabled = env.cloudinary.enabled;

  const totals = useMemo(() => {
    const km = items.reduce((acc, r) => acc + (r.totals?.distanceM ?? 0), 0) / 1000;
    const runs = items.length;
    const days = new Set(items.map((r) => new Date(r.startedAt).toDateString())).size;
    return {
      km: km.toFixed(1),
      runs,
      days,
    };
  }, [items]);

  const weekly = useMemo(() => {
    const buckets = new Array(7).fill(0) as number[];
    const now = Date.now();
    items.forEach((r) => {
      const diffDays = Math.floor((now - r.startedAt) / (24 * 60 * 60 * 1000));
      const weekIdx = 6 - Math.floor(diffDays / 7);
      if (weekIdx >= 0 && weekIdx < 7) {
        buckets[weekIdx] += (r.totals?.distanceM ?? 0) / 1000;
      }
    });
    const max = Math.max(...buckets, 1);
    return buckets.map((v) => Math.max(8, Math.round((v / max) * 90)));
  }, [items]);

  const initials = useMemo(() => {
    const src = profile.displayName || user?.email || 'AP';
    return src
      .split(/[\s.@_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }, [profile.displayName, user]);

  const handleAvatarPick = () => {
    // Si Cloudinary no esta listo, ni abre la bobada.
    if (!cloudinaryEnabled) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAvatarSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await uploadAvatar(file);
  };

  return (
    <AppLayout>
      <div className="flex justify-end px-4 pt-4">
        <IconButton icon="settings" ariaLabel="Ajustes" />
      </div>

      <div className="flex flex-col items-center px-5 pt-1">
        <button
          type="button"
          onClick={handleAvatarPick}
          disabled={!cloudinaryEnabled}
          aria-label="Cambiar avatar"
          className="relative grid place-items-center text-white font-display font-bold"
          style={{
            width: 92,
            height: 92,
            borderRadius: 99,
            fontSize: 34,
            // Muchachos, lo hice asi porque le copiamos a strava.
            background: profile.avatarUrl
              ? `url(${profile.avatarUrl}) center/cover`
              : 'linear-gradient(135deg,#FFB8A8,#FF4D2E)',
            boxShadow: '0 8px 24px rgba(255,77,46,0.3)',
            opacity: cloudinaryEnabled ? 1 : 0.6,
            cursor: cloudinaryEnabled ? 'pointer' : 'not-allowed',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {!profile.avatarUrl && initials}
          {cloudinaryEnabled && (
            <span
              className="absolute bottom-0 right-0 grid place-items-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: 99,
                background: '#fff',
                border: '2px solid var(--stride-bg-page)',
              }}
            >
              <Icon name="camera" size={14} color="var(--stride-ink)" strokeWidth={2.2} />
            </span>
          )}
        </button>
        {cloudinaryEnabled && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => void handleAvatarSelected(event)}
          />
        )}
        {!cloudinaryEnabled && (
          <div
            className="font-body font-semibold mt-2"
            style={{ fontSize: 12.5, color: 'var(--stride-ink-3)' }}
          >
            Subida de avatar deshabilitada · Cloudinary no configurado
          </div>
        )}
        <h1
          className="font-display font-bold mt-3"
          style={{ fontSize: 24, letterSpacing: -0.4 }}
        >
          {profile.displayName}
        </h1>
        <div
          className="font-body font-semibold"
          style={{ fontSize: 13.5, color: 'var(--stride-ink-3)' }}
        >
          {profile.email}
        </div>
      </div>

      {/* Totals */}
      <div className="mx-4 mt-5 bg-white rounded-[20px] py-5 px-4 grid grid-cols-3 shadow-stride">
        {[
          { v: totals.km, l: 'km totales' },
          { v: totals.runs, l: 'corridas' },
          { v: totals.days, l: 'días activos' },
        ].map((s, i) => (
          <div
            key={s.l}
            className="text-center"
            style={{
              borderRight: i < 2 ? '1px solid var(--stride-line)' : 'none',
            }}
          >
            <div className="stride-num font-bold" style={{ fontSize: 24 }}>
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

      {/* Achievements */}
      <div className="mx-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-body font-bold" style={{ fontSize: 16 }}>
            Logros
          </span>
          <button
            type="button"
            className="font-body font-bold"
            style={{ fontSize: 13, color: 'var(--stride-accent)' }}
          >
            Ver todos
          </button>
        </div>
        <div className="flex gap-3">
          {ACHIEVEMENT_CARDS.map((a) => (
            <div
              key={a.label}
              className="flex-1 bg-white rounded-[16px] py-3.5 px-2 text-center shadow-stride"
            >
              <span
                className="grid place-items-center mx-auto"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 99,
                  background: `${a.color}1A`,
                }}
              >
                <Icon name={a.icon} size={20} color={a.color} strokeWidth={2} />
              </span>
              <div
                className="font-body font-bold mt-2"
                style={{ fontSize: 11, color: 'var(--stride-ink-2)' }}
              >
                {a.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart */}
      <div className="mx-4 mt-5 bg-white rounded-[20px] p-5 shadow-stride">
        <div className="font-body font-bold mb-4" style={{ fontSize: 15 }}>
          Últimas 7 semanas
        </div>
        <div
          className="flex items-end justify-between gap-2"
          style={{ height: 100 }}
        >
          {weekly.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-[6px]"
                style={{
                  height: h,
                  background:
                    i === weekly.length - 1
                      ? 'var(--stride-accent)'
                      : 'var(--stride-bg-sunken)',
                }}
              />
              <span
                className="font-body font-semibold"
                style={{ fontSize: 10, color: 'var(--stride-ink-3)' }}
              >
                S{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
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
            {error}
          </div>
        </div>
      )}

      <div className="mx-4 mt-6">
        <StrideButton
          kind="danger"
          icon="logout"
          full
          loading={isLoading}
          onClick={() => void signOut()}
        >
          Cerrar sesión
        </StrideButton>
      </div>
    </AppLayout>
  );
};

export default ProfileScreen;
