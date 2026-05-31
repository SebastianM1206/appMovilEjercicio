import type { FC, ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

type StatRowProps = {
  icon: IconName;
  label: ReactNode;
  value: ReactNode;
  color?: string;
};

export const StatRow: FC<StatRowProps> = ({ icon, label, value, color = 'var(--stride-ink)' }) => (
  <div className="flex items-center gap-2.5">
    <span className="grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-stride-subtle shrink-0">
      <Icon name={icon} size={17} color="var(--stride-ink-2)" strokeWidth={2} />
    </span>
    <div className="min-w-0">
      <div className="stride-num font-bold leading-none" style={{ fontSize: 18, color }}>
        {value}
      </div>
      <div className="font-body font-semibold mt-1" style={{ fontSize: 11.5, color: 'var(--stride-ink-3)' }}>
        {label}
      </div>
    </div>
  </div>
);

export default StatRow;
