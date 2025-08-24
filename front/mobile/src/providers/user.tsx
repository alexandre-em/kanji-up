import React, { useEffect } from 'react';
import { getUniqueId } from 'react-native-device-info';

import { useAppDispatch } from '../hooks/useStore';
import { getUser } from '../store/slices/user';

const UserContext = React.createContext<null>(null);

export function useUser() {
  return React.useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // TODO: Check internet connection, if offline use local data
    getUniqueId().then((deviceId) => {
      dispatch(getUser({ macAddress: deviceId }));
    });
  }, [dispatch]);

  return <UserContext.Provider value={null}>{children}</UserContext.Provider>;
}
