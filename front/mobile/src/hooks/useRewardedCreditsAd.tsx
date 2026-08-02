import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRewardedAd } from 'react-native-google-mobile-ads';

import { REWARDED_AD_UNIT_ID } from '../config/ads';
import { useToaster } from '../providers/toaster';
import { earnCredits, selectUserState } from '../store/slices/user';
import { useAppDispatch, useAppSelector } from './useStore';

export function useRewardedCreditsAd() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const { macAddress } = useAppSelector(selectUserState);
  const { isLoaded, isClosed, isEarnedReward, load, show } = useRewardedAd(REWARDED_AD_UNIT_ID);
  // `load()` resets isClosed synchronously, so this only guards against React re-running the
  // effect for the same closure before that reset lands
  const hasHandledClose = useRef(false);

  useEffect(() => {
    load();
  }, [load]);

  // The ad closes whether or not the user watched it through — reload either way, otherwise a
  // skipped ad leaves the card permanently stuck on "not ready"
  useEffect(() => {
    if (!isClosed) {
      hasHandledClose.current = false;
      return;
    }
    if (hasHandledClose.current) return;
    hasHandledClose.current = true;

    if (isEarnedReward) {
      dispatch(earnCredits({ macAddress })).then(() => {
        toast?.show({ message: t('home.menu.ad.reward.toast'), type: 'success' });
      });
    }
    load();
  }, [isClosed, isEarnedReward, dispatch, macAddress, toast, t, load]);

  const showAd = useCallback(() => {
    if (isLoaded) show();
  }, [isLoaded, show]);

  return { isReady: isLoaded, show: showAd };
}
