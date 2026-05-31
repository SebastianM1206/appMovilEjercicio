import type { FC, ReactNode } from 'react';

type MetricProps = {
  value: ReactNode;
  unit?: ReactNode;
  label?: ReactNode;
  size?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
};

export const Metric: FC<MetricProps> = ({
  value,
  unit,
  label,
  size = 56,
  color = 'var(--stride-ink)',
  align = 'left',
  className,
}) => {
  const justify = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';
  const textAlign = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  return (
    <div className={[textAlign, className].filter(Boolean).join(' ')}>
      <div
        className={['stride-num flex items-baseline gap-1', justify].join(' ')}
        style={{ fontSize: size, lineHeight: 0.98, color, fontWeight: 700 }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: Math.max(12, size * 0.34),
              fontWeight: 600,
              color: 'var(--stride-ink-3)',
              letterSpacing: 0,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {label && (
        <div
          className="font-body uppercase font-semibold mt-1.5"
          style={{ fontSize: 12.5, color: 'var(--stride-ink-3)', letterSpacing: 1 }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default Metric;
