export type DeviceInfo = {
  platform: string;
  model: string;
  osVersion: string;
};

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  return { platform: 'web', model: 'browser', osVersion: 'unknown' };
};
