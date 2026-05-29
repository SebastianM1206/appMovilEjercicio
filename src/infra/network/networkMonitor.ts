import { Network } from '@capacitor/network';

export type NetworkStatus = 'online' | 'offline';

export type NetworkChangeHandler = (status: NetworkStatus) => void;

export const createNetworkMonitor = () => {
  let currentStatus: NetworkStatus = 'online';

  const setStatus = (status: NetworkStatus) => {
    currentStatus = status;
  };

  const getStatus = async (): Promise<NetworkStatus> => {
    const status = await Network.getStatus();
    currentStatus = status.connected ? 'online' : 'offline';
    return currentStatus;
  };

  const listen = (handler: NetworkChangeHandler) => {
    let listenerHandle: { remove: () => Promise<void> } | null = null;

    void (async () => {
      listenerHandle = await Network.addListener('networkStatusChange', (status) => {
        const next = status.connected ? 'online' : 'offline';
        setStatus(next);
        handler(next);
      });
    })();

    return () => {
      void listenerHandle?.remove();
    };
  };

  return {
    getStatus,
    setStatus,
    listen,
  };
};

export const networkMonitor = createNetworkMonitor();
