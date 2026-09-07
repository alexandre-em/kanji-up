import { useEffect, useState } from 'react';
import { getUniqueId } from 'react-native-device-info';
import { useSelector } from 'react-redux';

import { LAST_KNOWN_REGISTRATION_KEY, ONBOARDING_FINISHED_KEY } from '../constants/storage';
import { fileServiceInstance } from '../services/file';
import { getUser, selectGetUserStatus } from '../store/slices/user';
import { useAppDispatch } from './useStore';

const BOOT_TIMEOUT_MS = 10000;

export const useIsNotRegistered = () => {
  const dispatch = useAppDispatch();
  const getUserStatus = useSelector(selectGetUserStatus);
  const [isUserDataStocked, setIsUserDataStocked] = useState<boolean>();
  const [hasBootTimedOut, setHasBootTimedOut] = useState(false);
  const [cachedResult, setCachedResult] = useState<boolean>();
  const [accountConfirmedMissing, setAccountConfirmedMissing] = useState(false);

  useEffect(() => {
    getUniqueId().then((deviceId) => {
      dispatch(getUser({ macAddress: deviceId })).then((action) => {
        if (getUser.rejected.match(action) && action.payload?.status === 404) {
          setAccountConfirmedMissing(true);
          fileServiceInstance.remove(LAST_KNOWN_REGISTRATION_KEY);
          fileServiceInstance.remove(ONBOARDING_FINISHED_KEY);
        }
      });
    });
  }, [dispatch]);

  useEffect(() => {
    fileServiceInstance.read(ONBOARDING_FINISHED_KEY).then((data) => {
      setIsUserDataStocked(!!data);
    });
  }, []);

  useEffect(() => {
    fileServiceInstance.read(LAST_KNOWN_REGISTRATION_KEY).then((data) => {
      if (typeof data === 'boolean') setCachedResult(data);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHasBootTimedOut(true), BOOT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const isGetUserSettled = getUserStatus === 'succeeded' || getUserStatus === 'failed' || hasBootTimedOut;
  const isLiveResultReady = isUserDataStocked !== undefined && isGetUserSettled;
  const liveResult = isLiveResultReady
    ? accountConfirmedMissing || (getUserStatus !== 'succeeded' && isUserDataStocked === false)
    : undefined;

  useEffect(() => {
    if (liveResult === undefined) return;
    fileServiceInstance.write(LAST_KNOWN_REGISTRATION_KEY, liveResult);
  }, [liveResult]);

  return {
    isNotRegistered: liveResult !== undefined ? liveResult : cachedResult,
    accountConfirmedMissing,
  };
};
