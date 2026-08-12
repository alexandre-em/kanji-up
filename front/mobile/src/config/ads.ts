import Config from 'react-native-config';
import { TestIds } from 'react-native-google-mobile-ads';

// Falls back to Google's official test unit IDs whenever the real ones aren't in .env yet, so
// the app always has something valid to request instead of failing on an empty ad unit ID
export const REWARDED_AD_UNIT_ID = Config.ADMOB_REWARDED_UNIT_ID || TestIds.REWARDED;
export const BANNER_AD_UNIT_ID = Config.ADMOB_BANNER_UNIT_ID || TestIds.BANNER;
