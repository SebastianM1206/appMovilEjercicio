export type MapProvider = 'none' | 'google' | 'mapbox' | 'leaflet';

export type MapAdapter = {
  provider: MapProvider;
  setCenter: (lat: number, lon: number) => void;
};

export const createMapAdapter = (provider: MapProvider): MapAdapter => {
  return {
    provider,
    setCenter: () => undefined,
  };
};
