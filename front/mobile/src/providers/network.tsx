import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useRef, useState } from 'react';

import { useAppDispatch } from '../hooks/useStore';
import { flush as flushSyncQueue } from '../store/slices/syncQueue';

const NetworkContext = React.createContext<boolean>(false);

export function useIsOffline() {
  return React.useContext(NetworkContext);
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const dispatch = useAppDispatch();
  const wasOffline = useRef(false);

  useEffect(() => {
    // isInternetReachable stays null while still being determined — only isConnected === false
    // (or isInternetReachable explicitly resolving to false) counts as offline, not the null state
    return NetInfo.addEventListener((state) => {
      const nextIsOffline = state.isConnected === false || state.isInternetReachable === false;

      // Only the offline→online edge matters here — flushing on every online NetInfo event
      // (there can be several in a row) would just retry a queue that's already been drained
      if (wasOffline.current && !nextIsOffline) void dispatch(flushSyncQueue());
      wasOffline.current = nextIsOffline;

      setIsOffline(nextIsOffline);
    });
  }, [dispatch]);

  return <NetworkContext.Provider value={isOffline}>{children}</NetworkContext.Provider>;
}
