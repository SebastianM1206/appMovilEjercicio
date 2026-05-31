import { useEffect, type FC } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RunSample } from '../../features/run/domain/runRecorder';

const DEFAULT_CENTER: [number, number] = [4.711, -74.072]; // Bogotá fallback
const ROUTE_COLOR = '#FF4D2E';

const MapFitter: FC<{ samples: RunSample[]; live?: boolean }> = ({ samples, live }) => {
  const map = useMap();
  useEffect(() => {
    if (samples.length === 0) return;
    const last = samples[samples.length - 1];
    if (live) {
      map.panTo([last.lat, last.lon]);
    } else if (samples.length === 1) {
      map.setView([last.lat, last.lon], 16);
    } else {
      map.fitBounds(
        L.latLngBounds(samples.map((s) => [s.lat, s.lon] as [number, number])),
        { padding: [30, 30], maxZoom: 17 },
      );
    }
  }, [samples, live, map]);
  return null;
};

type MapRouteProps = {
  samples?: RunSample[];
  live?: boolean;
  height?: number;
  showPin?: boolean;
  pinLabel?: string;
  pinColor?: string;
  faded?: boolean;
  compact?: boolean;
  className?: string;
};

export const MapRoute: FC<MapRouteProps> = ({
  samples = [],
  live,
  height = 280,
  showPin = true,
  pinLabel = 'GPS fuerte',
  pinColor = 'var(--stride-success)',
  faded,
  compact,
  className,
}) => {
  const positions: [number, number][] = samples.map((s) => [s.lat, s.lon]);
  const lastPos = positions[positions.length - 1];

  return (
    <div
      className={['relative w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <MapContainer
        center={lastPos ?? DEFAULT_CENTER}
        zoom={16}
        style={{ width: '100%', height: '100%', opacity: faded ? 0.55 : 1 }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: ROUTE_COLOR, weight: 5, lineCap: 'round', lineJoin: 'round' }}
          />
        )}
        {lastPos && (
          <CircleMarker
            center={lastPos}
            radius={8}
            pathOptions={{ color: '#fff', fillColor: ROUTE_COLOR, fillOpacity: 1, weight: 3 }}
          />
        )}
        <MapFitter samples={samples} live={live} />
      </MapContainer>
      {showPin && !compact && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-[10px] bg-white px-2.5 py-1.5 shadow-stride font-body font-semibold"
          style={{ fontSize: 12, color: 'var(--stride-ink)', zIndex: 1000 }}
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
