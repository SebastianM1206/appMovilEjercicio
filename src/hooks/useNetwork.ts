import { useEffect, useState } from 'react';
import { networkMonitor, type NetworkStatus } from '../infra/network/networkMonitor';

export type NetworkState = {
  status: NetworkStatus;
};

export const useNetwork = () => {
  const [status, setStatus] = useState<NetworkStatus>('online');

  useEffect(() => {
    const syncStatus = async () => {
      const current = await networkMonitor.getStatus();
      setStatus(current);
    };

    void syncStatus();

    const unsubscribe = networkMonitor.listen((nextStatus) => {
      setStatus(nextStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { status };
};
