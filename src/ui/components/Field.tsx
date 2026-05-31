import { useState, type FC, type InputHTMLAttributes, type ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  value: string;
  onChangeValue: (next: string) => void;
  icon?: IconName;
  error?: string | null;
  ok?: boolean;
  trailing?: ReactNode;
};

export const Field: FC<FieldProps> = ({
  label,
  value,
  onChangeValue,
  icon,
  error,
  ok,
  trailing,
  className = '',
  ...rest
}) => {
  const [focus, setFocus] = useState(false);
  const borderColor = error
    ? 'var(--stride-danger)'
    : ok
      ? 'var(--stride-success)'
      : focus
        ? 'var(--stride-ink)'
        : 'var(--stride-line-2)';
  return (
    <div className={className}>
      <div
        className="font-body font-bold mb-[7px]"
        style={{ color: 'var(--stride-ink-2)', fontSize: 13 }}
      >
        {label}
      </div>
      <div
        className="flex items-center gap-2.5 h-[54px] px-[14px] rounded-[14px] bg-white transition-colors"
        style={{ border: `1.5px solid ${borderColor}` }}
      >
        {icon && (
          <Icon
            name={icon}
            size={19}
            color={focus ? 'var(--stride-ink)' : 'var(--stride-ink-3)'}
            strokeWidth={2}
          />
        )}
        <input
          value={value}
          onChange={(event) => onChangeValue(event.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="flex-1 min-w-0 bg-transparent outline-none border-none font-body font-medium text-base"
          style={{ color: 'var(--stride-ink)' }}
          {...rest}
        />
        {ok && <Icon name="check" size={18} color="var(--stride-success)" strokeWidth={2.6} />}
        {trailing}
      </div>
      {error && (
        <div
          className="font-body font-semibold mt-1.5 flex items-center gap-1.5"
          style={{ fontSize: 12.5, color: 'var(--stride-danger)' }}
          role="alert"
        >
          <Icon name="x" size={13} strokeWidth={2.6} />
          {error}
        </div>
      )}
    </div>
  );
};

export default Field;
