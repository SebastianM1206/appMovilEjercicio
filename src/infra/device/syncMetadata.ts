import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';

export type SyncMetadata = {
  appVersion: string;
  deviceModel: string;
};

export const getSyncMetadata = async (): Promise<SyncMetadata> => {
  const [appInfo, deviceInfo] = await Promise.all([
    App.getInfo().catch(() => ({ version: '0.0.1', build: '0', name: 'movilesFinal', id: '' })),
    Device.getInfo().catch(() => ({
      model: 'unknown',
      platform: 'unknown',
      operatingSystem: 'unknown',
      osVersion: 'unknown',
      manufacturer: 'unknown',
      isVirtual: false,
      webViewVersion: 'unknown',
    })),
  ]);

  return {
    appVersion: appInfo.version,
    deviceModel: deviceInfo.model ?? 'unknown',
  };
};
