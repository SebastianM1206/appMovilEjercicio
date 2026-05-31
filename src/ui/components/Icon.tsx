import type { CSSProperties, FC } from 'react';

export const ICONS = {
  run: 'M13.5 5.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM7 21l2.2-5.2 2.3 1.8V21M9.4 9.2 12 7.4l2.4 1.7 1.2 2.2 2.6 1M5 13.4l2.6-1 1.8-3.2 3 0.6',
  history: 'M3.05 11a9 9 0 1 1 .5 4M3 11v4h4M12 8v4l3 2',
  trophy:
    'M7 4h10v3a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 14.5V17h6v-2.5M8 21h8M12 17v4',
  user: 'M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z',
  play: 'M7 4.5v15l13-7.5-13-7.5Z',
  pause: 'M8 5h3v14H8zM13 5h3v14h-3z',
  stop: 'M6 6h12v12H6z',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  gps: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3',
  camera:
    'M4 8a2 2 0 0 1 2-2h1.5l1-1.6a1 1 0 0 1 .9-.5h5.2a1 1 0 0 1 .9.5l1 1.6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  share: 'M16 6l-4-4-4 4M12 2v13M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  chevR: 'M9 6l6 6-6 6',
  chevL: 'M15 6l-6 6 6 6',
  chevD: 'M6 9l6 6 6-6',
  check: 'M5 12.5l4.5 4.5L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  flame:
    'M12 22a7 7 0 0 0 7-7c0-3-2-5.2-3.5-7C14.5 6.5 13 4 13 2c-2 1.5-6 4.5-6 9.5A7 7 0 0 0 12 22ZM12 22a3 3 0 0 0 3-3c0-1.6-1.3-2.7-2-3.8-.8 1.1-2 2.2-2 3.8a3 3 0 0 0 1 3Z',
  heart: 'M12 20s-7-4.3-9.2-8.3C1.2 8.5 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 4.8 3.5 3.2 6.7C19 15.7 12 20 12 20Z',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 17h6a3 3 0 0 0 3-3V9M16 7h-5a3 3 0 0 0-3 3v7',
  calendar: 'M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6ZM5 9h14M8 3v3M16 3v3',
  filter: 'M3 5h18l-7 8v5l-4 2v-7L3 5Z',
  sync: 'M20 11a8 8 0 0 0-14.5-4.5M4 4v3h3M4 13a8 8 0 0 0 14.5 4.5M20 20v-3h-3',
  cloudOff: 'M3 3l18 18M18.7 16.7A4 4 0 0 0 17 9h-1.3A6 6 0 0 0 6.5 6.5M5.6 8.6A4 4 0 0 0 7 16h9',
  wifiOff:
    'M3 3l18 18M9 17l3 3 3-3a4.2 4.2 0 0 0-6 0M5 12.5a11 11 0 0 1 4-2.4M2 9a16 16 0 0 1 5-3M22 9a16 16 0 0 0-9.5-3.9',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9ZM10 21a2 2 0 0 0 4 0',
  lock: 'M6 11a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7ZM8 9V7a4 4 0 0 1 8 0v2',
  mail: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7ZM4 7l8 6 8-6',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff:
    'M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.3A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7c1 0 1.9-.1 2.7-.4',
  arrowL: 'M19 12H5M11 18l-6-6 6-6',
  arrowR: 'M5 12h14M13 6l6 6-6 6',
  more: 'M12 6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 19.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  speed: 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM13.4 10.6 17 7M5 19a9 9 0 1 1 14 0',
  medal: 'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM9 13l-2 8 5-3 5 3-2-8',
  trend: 'M3 17l6-6 4 4 8-8M21 7v5h-5',
  logout: 'M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9',
  edit: 'M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 6.5l3 3',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z',
  shield: 'M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3ZM9 12l2 2 4-4',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  zap: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
};

const SOLID_ICONS = new Set<IconName>(['play', 'stop', 'pause', 'more']);

export const Icon: FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.9,
  className,
  style,
}) => {
  const d = ICONS[name];
  const isSolid = SOLID_ICONS.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isSolid ? color : 'none'}
      stroke={isSolid ? 'none' : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {d
        .split('M')
        .filter(Boolean)
        .map((seg, i) => (
          <path key={i} d={`M${seg}`} />
        ))}
    </svg>
  );
};

export default Icon;
