export type NetworkStatus = 'online' | 'offline';

export const createNetworkMonitor = () => {
  let status: NetworkStatus = 'online';

  return {
    getStatus: () => status,
    setStatus: (next: NetworkStatus) => {
      status = next;
    }
  };
};
