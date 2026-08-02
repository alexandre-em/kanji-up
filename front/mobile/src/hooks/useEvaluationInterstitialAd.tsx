import { useCallback, useEffect, useRef } from 'react';
import { useInterstitialAd } from 'react-native-google-mobile-ads';

import { INTERSTITIAL_AD_UNIT_ID } from '../config/ads';
import { selectUserState } from '../store/slices/user';
import { useAppSelector } from './useStore';

// Shown once at the natural break point of finishing an evaluation session — not on every
// navigation, to avoid interrupting a beginner mid-task
export function useEvaluationInterstitialAd() {
  const { subscriptionPlan, adsDeactivated } = useAppSelector(selectUserState);
  const skipAds = subscriptionPlan === 'premium' || adsDeactivated;
  const { isLoaded, isClosed, load, show } = useInterstitialAd(skipAds ? null : INTERSTITIAL_AD_UNIT_ID);
  const hasHandledClose = useRef(false);

  useEffect(() => {
    if (!skipAds) load();
  }, [skipAds, load]);

  // Reload for the next evaluation session once this one's ad has been dismissed
  useEffect(() => {
    if (!isClosed) {
      hasHandledClose.current = false;
      return;
    }
    if (hasHandledClose.current) return;
    hasHandledClose.current = true;

    load();
  }, [isClosed, load]);

  return useCallback(() => {
    if (!skipAds && isLoaded) show();
  }, [skipAds, isLoaded, show]);
}
