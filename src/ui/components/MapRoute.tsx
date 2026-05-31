import type { FC } from 'react';

const ROUTE =
  'M58 232 C70 180 110 176 132 150 C150 128 138 96 168 84 C206 68 250 96 268 70 C286 46 264 22 300 28';
const TOTAL_LEN = 470;

const PTS: [number, number][] = [
  [58, 232],
  [110, 178],
  [132, 150],
  [160, 100],
  [210, 80],
  [258, 76],
  [280, 40],
  [300, 28],
];

const positionAt = (p: number) => {
  const clamped = Math.max(0, Math.min(1, p));
  const i = Math.min(PTS.length - 2, Math.floor(clamped * (PTS.length - 1)));
  const t = clamped * (PTS.length - 1) - i;
  return {
    x: PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * t,
    y: PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * t,
  };
};

type MapRouteProps = {
  progress?: number;
  height?: number;
  showPin?: boolean;
  pinLabel?: string;
  pinColor?: string;
  faded?: boolean;
  compact?: boolean;
  className?: string;
};

export const MapRoute: FC<MapRouteProps> = ({
  progress = 1,
  height = 280,
  showPin = true,
  pinLabel = 'GPS fuerte',
  pinColor = 'var(--stride-success)',
  faded,
  compact,
  className,
}) => {
  const pos = positionAt(progress);
  return (
    <div
      className={['relative w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ height, background: 'var(--stride-map-land)' }}
    >
      <svg
        viewBox="0 0 360 280"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        style={{ opacity: faded ? 0.55 : 1 }}
      >
        <rect width="360" height="280" fill="var(--stride-map-land)" />
        <path
          d="M0 0 H140 C120 40 150 70 110 96 C70 120 90 150 40 160 L0 150 Z"
          fill="var(--stride-map-water)"
        />
        <rect
          x="250"
          y="200"
          width="160"
          height="120"
          rx="8"
          fill="var(--stride-map-water)"
          transform="rotate(8 300 240)"
        />
        <rect x="178" y="150" width="120" height="86" rx="10" fill="var(--stride-map-park)" />
        <circle cx="70" cy="60" r="34" fill="var(--stride-map-park)" />
        <g stroke="var(--stride-map-road)" strokeWidth="9" fill="none" strokeLinecap="round">
          <path d="M-10 210 H370" />
          <path d="M-10 120 H370" />
          <path d="M120 -10 V290" />
          <path d="M250 -10 V290" />
          <path d="M40 290 L200 60 L360 -10" opacity="0.85" />
        </g>
        <g stroke="#F4F6F7" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M-10 165 H370" />
          <path d="M70 -10 V290" />
          <path d="M310 -10 V290" />
        </g>
        <path d={ROUTE} fill="none" stroke="rgba(224,56,15,0.18)" strokeWidth="11" strokeLinecap="round" />
        <path
          d={ROUTE}
          fill="none"
          stroke="var(--stride-accent)"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeDasharray={TOTAL_LEN}
          strokeDashoffset={TOTAL_LEN * (1 - Math.max(0, Math.min(1, progress)))}
        />
        <circle cx="58" cy="232" r="6.5" fill="#fff" stroke="var(--stride-ink)" strokeWidth="3.5" />
        {progress < 1 && !compact && (
          <g>
            <circle cx={pos.x} cy={pos.y} r="13" fill="rgba(255,77,46,0.18)">
              <animate attributeName="r" values="9;15;9" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx={pos.x} cy={pos.y} r="6.5" fill="var(--stride-accent)" stroke="#fff" strokeWidth="3" />
          </g>
        )}
        {progress >= 1 && (
          <circle cx="300" cy="28" r="6.5" fill="var(--stride-accent)" stroke="#fff" strokeWidth="3.5" />
        )}
      </svg>
      {showPin && !compact && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-[10px] bg-white px-2.5 py-1.5 shadow-stride font-body font-semibold"
          style={{ fontSize: 12, color: 'var(--stride-ink)' }}
        >
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: pinColor }} />
          {pinLabel}
        </div>
      )}
    </div>
  );
};

type MiniRouteProps = {
  seed?: number;
  color?: string;
  className?: string;
};

const MINI_PATHS = [
  'M6 34 C14 18 28 26 30 14 C32 4 44 8 50 18',
  'M6 14 C16 26 22 10 34 20 C44 28 40 8 52 12',
  'M8 26 C18 12 24 30 32 18 C40 8 46 28 52 16',
];

export const MiniRoute: FC<MiniRouteProps> = ({ seed = 0, color = 'var(--stride-accent)', className }) => (
  <svg width="58" height="42" viewBox="0 0 58 42" className={className} aria-hidden="true">
    <path
      d={MINI_PATHS[seed % MINI_PATHS.length]}
      fill="none"
      stroke="var(--stride-line-2)"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <path
      d={MINI_PATHS[seed % MINI_PATHS.length]}
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </svg>
);

export default MapRoute;
