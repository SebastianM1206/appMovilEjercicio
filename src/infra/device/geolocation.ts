export type GeoPoint = {
  lat: number;
  lon: number;
  accuracy: number;
  ts: number;
};

export const getCurrentPosition = async (): Promise<GeoPoint> => {
  return { lat: 0, lon: 0, accuracy: 0, ts: Date.now() };
};
