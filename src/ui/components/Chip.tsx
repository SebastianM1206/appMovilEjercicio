import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  active?: boolean;
  icon?: IconName;
  children?: ReactNode;
};

export const Chip: FC<ChipProps> = ({
  active,
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={[
      'inline-flex items-center gap-1.5 h-9 px-[14px] rounded-full font-body font-semibold text-[13.5px] whitespace-nowrap transition-colors',
      active ? 'bg-stride-ink text-white' : 'bg-stride-subtle text-stride-ink-2 active:bg-stride-sunken',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    style={{ WebkitTapHighlightColor: 'transparent' }}
    {...rest}
  >
    {icon && <Icon name={icon} size={15} strokeWidth={2.2} />}
    {children}
  </button>
);

export default Chip;
