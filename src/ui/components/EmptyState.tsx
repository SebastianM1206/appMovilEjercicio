import type { FC, ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

type EmptyStateProps = {
  icon?: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const EmptyState: FC<EmptyStateProps> = ({
  icon = 'route',
  title,
  description,
  action,
  className,
}) => (
  <div
    className={['flex flex-col items-center text-center px-6 py-10 rounded-3xl bg-white shadow-stride', className]
      .filter(Boolean)
      .join(' ')}
  >
    <span
      className="grid place-items-center rounded-2xl mb-4"
      style={{ width: 64, height: 64, background: 'var(--stride-accent-tint)' }}
    >
      <Icon name={icon} size={30} color="var(--stride-accent)" strokeWidth={2} />
    </span>
    <h3 className="font-display font-bold text-stride-ink" style={{ fontSize: 19, letterSpacing: -0.3 }}>
      {title}
    </h3>
    {description && (
      <p
        className="font-body mt-2 max-w-[320px]"
        style={{ color: 'var(--stride-ink-2)', fontSize: 14, lineHeight: 1.5 }}
      >
        {description}
      </p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
