import { AdsConsent } from 'react-native-google-mobile-ads';

// Google's UMP flow: gather (and show the form if required, e.g. EEA/UK) consent before any ad
// request is made. Required by Play Store policy — not just a nicety for personalized ads.
export async function gatherAdsConsent(): Promise<boolean> {
  const info = await AdsConsent.gatherConsent();
  return info.canRequestAds;
}
