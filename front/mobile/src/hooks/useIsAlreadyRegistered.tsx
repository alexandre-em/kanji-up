import { useEffect, useState } from 'react';
import { getUniqueId } from 'react-native-device-info';
import { useSelector } from 'react-redux';

import { LAST_KNOWN_REGISTRATION_KEY, ONBOARDING_FINISHED_KEY } from '../constants/storage';
import { fileServiceInstance } from '../services/file';
import { getUser, selectGetUserStatus } from '../store/slices/user';
import { useAppDispatch } from './useStore';

// getUniqueId() or the getUser request can hang with nothing to catch (flaky emulator, dead
// backend) — this hard ceiling guarantees the boot gate always resolves instead of spinning
// forever on the loading screen.
const BOOT_TIMEOUT_MS = 10000;

export const useIsNotRegistered = () => {
  const dispatch = useAppDispatch();
  const getUserStatus = useSelector(selectGetUserStatus);
  const [isUserDataStocked, setIsUserDataStocked] = useState<boolean>();
  const [hasBootTimedOut, setHasBootTimedOut] = useState(false);
  // What the previous launch resolved to — shown immediately so the boot gate doesn't wait on the
  // network every single time. Only used until the live check below settles; if it turns out to
  // have been wrong (but the account still exists), this launch briefly shows the wrong initial
  // route and self-heals (the cache is rewritten below once the live result is known, so the NEXT
  // launch is correct) — not worth an imperative mid-session redirect for. A confirmed-missing
  // account (see accountConfirmedMissing) is the one case that does force a redirect: see router.tsx.
  const [cachedResult, setCachedResult] = useState<boolean>();
  // True once the mac-address lookup comes back 404 — the account itself no longer exists
  // server-side, as opposed to a transient failure (network, 5xx), which shouldn't be treated the
  // same way (those already fall back to the cache/local flag instead)
  const [accountConfirmedMissing, setAccountConfirmedMissing] = useState(false);

  useEffect(() => {
    getUniqueId().then((deviceId) => {
      dispatch(getUser({ macAddress: deviceId })).then((action) => {
        if (getUser.rejected.match(action) && action.payload?.status === 404) {
          setAccountConfirmedMissing(true);
          // Both caches would otherwise keep telling the app this device is registered
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
  // Deliberately NOT keyed on userName: it's the same Redux field the onboarding name field
  // writes to on every keystroke, well before any account exists — trusting it here let a typed
  // (but never submitted-successfully) name make this resolve "registered" with no real account.
  // isUserDataStocked is the durable signal instead: only ever set once ONBOARDING_FINISHED_KEY
  // is actually persisted, either after a successful create or a confirmed existing account.
  const liveResult = isLiveResultReady ? accountConfirmedMissing || isUserDataStocked === false : undefined;

  useEffect(() => {
    if (liveResult === undefined) return;
    fileServiceInstance.write(LAST_KNOWN_REGISTRATION_KEY, liveResult);
  }, [liveResult]);

  return {
    isNotRegistered: liveResult !== undefined ? liveResult : cachedResult,
    accountConfirmedMissing,
  };
};
