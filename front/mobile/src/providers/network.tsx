import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';

const NetworkContext = React.createContext<boolean>(false);

export function useIsOffline() {
  return React.useContext(NetworkContext);
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // isInternetReachable stays null while still being determined — only isConnected === false
    // (or isInternetReachable explicitly resolving to false) counts as offline, not the null state
    return NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });
  }, []);

  return <NetworkContext.Provider value={isOffline}>{children}</NetworkContext.Provider>;
}
