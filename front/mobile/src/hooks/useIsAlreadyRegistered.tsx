import { useEffect, useState } from 'react';
import { getUniqueId } from 'react-native-device-info';
import { useSelector } from 'react-redux';

import { ONBOARDING_FINISHED_KEY } from '../constants/storage';
import { fileServiceInstance } from '../services/file';
import { getUser, selectGetUserStatus, selectUserName } from '../store/slices/user';
import { useAppDispatch } from './useStore';

// getUniqueId() or the getUser request can hang with nothing to catch (flaky emulator, dead
// backend) — this hard ceiling guarantees the boot gate always resolves instead of spinning
// forever on the loading screen.
const BOOT_TIMEOUT_MS = 10000;

export const useIsNotRegistered = () => {
  const dispatch = useAppDispatch();
  const userName = useSelector(selectUserName);
  const getUserStatus = useSelector(selectGetUserStatus);
  const [isUserDataStocked, setIsUserDataStocked] = useState<boolean>();
  const [hasBootTimedOut, setHasBootTimedOut] = useState(false);

  useEffect(() => {
    getUniqueId().then((deviceId) => {
      dispatch(getUser({ macAddress: deviceId }));
    });
  }, [dispatch]);

  useEffect(() => {
    fileServiceInstance.read(ONBOARDING_FINISHED_KEY).then((data) => {
      setIsUserDataStocked(!!data);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHasBootTimedOut(true), BOOT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const isGetUserSettled = getUserStatus === 'succeeded' || getUserStatus === 'failed' || hasBootTimedOut;

  if (isUserDataStocked === undefined || !isGetUserSettled) {
    return undefined;
  }

  return userName === '' && isUserDataStocked === false;
};
