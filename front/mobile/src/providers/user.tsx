import React, { useEffect } from 'react';

import { useAppDispatch } from '../hooks/useStore';
import { initialize as initializeKanji } from '../store/slices/selectedKanji';

const UserContext = React.createContext<null>(null);

export function useUser() {
  return React.useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // TEMP: auth (getUser) call skipped for dev — API returns 500/503 on the emulator, revert before shipping
    dispatch(initializeKanji());
  }, [dispatch]);

  return <UserContext.Provider value={null}>{children}</UserContext.Provider>;
}
