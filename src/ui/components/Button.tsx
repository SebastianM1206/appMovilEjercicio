import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

type ButtonKind = 'primary' | 'dark' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type StrideButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: IconName;
  iconTrailing?: IconName;
  loading?: boolean;
  full?: boolean;
  children?: ReactNode;
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm gap-2',
  md: 'h-[52px] px-[22px] text-base gap-[9px]',
  lg: 'h-[58px] px-[26px] text-[17px] gap-[10px]',
};

const KIND_CLASSES: Record<ButtonKind, string> = {
  primary:
    'bg-stride-accent text-white shadow-stride-accent active:bg-stride-accent-dark disabled:opacity-60',
  dark: 'bg-stride-ink text-white active:bg-black disabled:opacity-60',
  ghost: 'bg-stride-subtle text-stride-ink active:bg-stride-sunken disabled:opacity-60',
  outline:
    'bg-white text-stride-ink border-[1.5px] border-stride-line-2 active:bg-stride-subtle disabled:opacity-60',
  danger:
    'bg-stride-danger-soft text-stride-danger active:bg-[#f7d7d9] disabled:opacity-60',
};

export const StrideButton: FC<StrideButtonProps> = ({
  kind = 'primary',
  size = 'md',
  icon,
  iconTrailing,
  loading,
  full,
  children,
  className = '',
  type = 'button',
  ...rest
}) => {
  const iconSize = size === 'sm' ? 18 : 20;
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center font-bold tracking-wide rounded-full transition-colors',
        'font-body',
        full ? 'w-full' : '',
        SIZE_CLASSES[size],
        KIND_CLASSES[kind],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      {...rest}
    >
      {loading ? (
        <span
          className="stride-spin inline-block rounded-full border-[2.5px] border-white/40 border-t-white"
          style={{ width: iconSize, height: iconSize }}
        />
      ) : (
        <>
          {icon && <Icon name={icon} size={iconSize} strokeWidth={2.1} />}
          {children}
          {iconTrailing && <Icon name={iconTrailing} size={iconSize} strokeWidth={2.1} />}
        </>
      )}
    </button>
  );
};

export default StrideButton;
