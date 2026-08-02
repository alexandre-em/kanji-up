import { useState } from 'react';
import { StyleProp, View as RNView, ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useSelector } from 'react-redux';

import { BANNER_AD_UNIT_ID } from '../config/ads';
import { selectUserState } from '../store/slices/user';

// Standard BANNER size (320x50dp) rather than an adaptive banner: a fixed height keeps every
// screen's bottom clearance calculation static instead of depending on an async size callback
export const BANNER_AD_HEIGHT = 50;

export default function AppBannerAd({ style }: { style?: StyleProp<ViewStyle> }) {
  const { subscriptionPlan, adsDeactivated } = useSelector(selectUserState);
  // No empty gap left behind for a banner that never rendered
  const [hasFailed, setHasFailed] = useState(false);

  if (subscriptionPlan === 'premium' || adsDeactivated || hasFailed) return null;

  return (
    <RNView style={style}>
      <BannerAd unitId={BANNER_AD_UNIT_ID} size={BannerAdSize.BANNER} onAdFailedToLoad={() => setHasFailed(true)} />
    </RNView>
  );
}
