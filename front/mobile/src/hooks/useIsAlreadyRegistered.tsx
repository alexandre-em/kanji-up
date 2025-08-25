import { useEffect, useState } from 'react';
import { getUniqueId } from 'react-native-device-info';
import { useSelector } from 'react-redux';

import { ONBOARDING_FINISHED_KEY } from '../constants/storage';
import { fileServiceInstance } from '../services/file';
import { getUser, selectGetUserStatus, selectUserName } from '../store/slices/user';
import { useAppDispatch } from './useStore';

export const useIsAlreadyRegistered = () => {
  const dispatch = useAppDispatch();
  const userName = useSelector(selectUserName);
  const getUserStatus = useSelector(selectGetUserStatus);
  const [isUserDataStocked, setIsUserDataStocked] = useState<boolean>();

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

  return userName !== '' && isUserDataStocked && getUserStatus === 'succeeded';
};

export const useIsNotRegistered = () => {
  const dispatch = useAppDispatch();
  const userName = useSelector(selectUserName);
  const getUserStatus = useSelector(selectGetUserStatus);
  const [isUserDataStocked, setIsUserDataStocked] = useState<boolean>();

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

  return userName === '' && isUserDataStocked === false && getUserStatus === 'failed';
};
