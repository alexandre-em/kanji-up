import { useEffect, useState } from 'react';

import { ONBOARDING_FINISHED_KEY } from '../constants/storage';
import { fileServiceInstance } from '../services/file';

export const useIsNotRegistered = () => {
  const [isUserDataStocked, setIsUserDataStocked] = useState<boolean>();

  // TEMP: auth (getUser) call skipped for dev — API returns 500/503 on the emulator, revert before shipping
  useEffect(() => {
    fileServiceInstance.read(ONBOARDING_FINISHED_KEY).then((data) => {
      setIsUserDataStocked(!!data);
    });
  }, []);

  return isUserDataStocked === false;
};
