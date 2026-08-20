import React, { useEffect } from 'react';
import { getUniqueId } from 'react-native-device-info';

import { useAppDispatch } from '../hooks/useStore';
import { initialize as initializeFlashcards } from '../store/slices/flashcards';
import { initialize as initializeLists } from '../store/slices/lists';
import { initialize as initializeKanji } from '../store/slices/selectedKanji';
import { flush as flushSyncQueue, initialize as initializeSyncQueue } from '../store/slices/syncQueue';
import { getUser } from '../store/slices/user';
import { initialize as initializeWordLists } from '../store/slices/wordLists';

const UserContext = React.createContext<null>(null);

export function useUser() {
  return React.useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    getUniqueId().then(async (deviceId) => {
      // The queue must be loaded before getUser runs — getUser checks it to decide whether to
      // keep local progression instead of the server's, and a not-yet-loaded (empty) queue would
      // wrongly look like there's nothing pending right when that guard matters most: right after
      // a restart that never got to flush the previous session's queue.
      await dispatch(initializeSyncQueue());
      await dispatch(getUser({ macAddress: deviceId }));
      dispatch(initializeKanji());
      dispatch(initializeFlashcards());
      dispatch(initializeLists());
      dispatch(initializeWordLists());
      // In case there's anything left over from before the app was last closed and a connection
      // is already available now — the NetworkProvider only catches the offline→online edge,
      // this catches "already online at launch"
      dispatch(flushSyncQueue());
    });
  }, [dispatch]);

  return <UserContext.Provider value={null}>{children}</UserContext.Provider>;
}
