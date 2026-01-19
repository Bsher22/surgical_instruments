// src/hooks/useNetworkStatus.ts
// Real-time network connectivity monitoring

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  details: NetInfoState['details'];
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
    details: null,
  });

  const updateStatus = useCallback((state: NetInfoState) => {
    setStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
      details: state.details,
    });
  }, []);

  useEffect(() => {
    // Get initial status
    NetInfo.fetch().then(updateStatus);

    // Subscribe to changes
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(updateStatus);

    return () => {
      unsubscribe();
    };
  }, [updateStatus]);

  // Utility to manually refresh status
  const refresh = useCallback(async () => {
    const state = await NetInfo.refresh();
    updateStatus(state);
    return status;
  }, [updateStatus, status]);

  return {
    ...status,
    isOffline: !status.isConnected || status.isInternetReachable === false,
    refresh,
  };
};

export default useNetworkStatus;
