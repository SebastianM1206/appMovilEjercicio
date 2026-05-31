import type { ButtonHTMLAttributes, FC } from 'react';
import Icon, { type IconName } from './Icon';

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName;
  size?: number;
  iconSize?: number;
  variant?: 'flat' | 'outline' | 'subtle' | 'dark';
  color?: string;
  ariaLabel: string;
};

const VARIANT_CLASSES: Record<NonNullable<IconButtonProps['variant']>, string> = {
  flat: 'bg-white shadow-stride',
  outline: 'bg-white border-[1.5px] border-stride-line-2',
  subtle: 'bg-stride-subtle',
  dark: 'bg-stride-ink text-white',
};

export const IconButton: FC<IconButtonProps> = ({
  icon,
  size = 40,
  iconSize,
  variant = 'flat',
  color,
  ariaLabel,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    aria-label={ariaLabel}
    className={[
      'inline-grid place-items-center rounded-full border-none cursor-pointer transition-colors',
      VARIANT_CLASSES[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    style={{
      width: size,
      height: size,
      WebkitTapHighlightColor: 'transparent',
      color: color ?? 'var(--stride-ink)',
    }}
    {...rest}
  >
    <Icon name={icon} size={iconSize ?? Math.round(size * 0.5)} strokeWidth={2.1} />
  </button>
);

export default IconButton;
