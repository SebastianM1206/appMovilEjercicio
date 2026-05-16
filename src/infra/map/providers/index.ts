export const availableMapProviders = ['google', 'mapbox', 'leaflet'] as const;

export type AvailableMapProvider = (typeof availableMapProviders)[number];
