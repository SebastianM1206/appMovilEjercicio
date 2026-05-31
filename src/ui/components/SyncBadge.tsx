import type { FC } from 'react';
import Icon, { type IconName } from './Icon';

export type SyncState = 'pending' | 'syncing' | 'synced' | 'error';

type Config = { icon: IconName; label: string; bg: string; fg: string };

const CONFIG: Record<SyncState, Config> = {
  pending: { icon: 'cloudOff', label: 'Pendiente', bg: 'var(--stride-warn-soft)', fg: 'var(--stride-warn)' },
  syncing: { icon: 'sync', label: 'Sincronizando', bg: '#EAF1FF', fg: 'var(--stride-info)' },
  synced: { icon: 'check', label: 'Sincronizado', bg: 'var(--stride-success-soft)', fg: 'var(--stride-success)' },
  error: { icon: 'wifiOff', label: 'Error', bg: 'var(--stride-danger-soft)', fg: 'var(--stride-danger)' },
};

type SyncBadgeProps = {
  state?: SyncState;
  className?: string;
  label?: string;
};

export const SyncBadge: FC<SyncBadgeProps> = ({ state = 'synced', className, label }) => {
  const cfg = CONFIG[state];
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-body font-bold',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: cfg.bg,
        color: cfg.fg,
        padding: '4px 9px 4px 7px',
        fontSize: 11.5,
      }}
    >
      <Icon
        name={cfg.icon}
        size={13}
        strokeWidth={2.4}
        className={state === 'syncing' ? 'stride-spin' : undefined}
      />
      {label ?? cfg.label}
    </span>
  );
};

export default SyncBadge;
