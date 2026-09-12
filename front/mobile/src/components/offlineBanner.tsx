import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { useIsOffline } from '../providers/network';

type OfflineBannerProps = {
  /** Distance from the top of the screen to clear — the caller already knows whether there's a
   * header to sit below (Layout measures it via useHeaderHeight) */
  topOffset: number;
};

export default function OfflineBanner({ topOffset }: OfflineBannerProps) {
  const { t } = useTranslation();
  const isOffline = useIsOffline();

  if (!isOffline) return null;

  return (
    <RNView style={[styles.banner, { top: topOffset, backgroundColor: Colors.$backgroundWarningLight }]}>
      <Text text90BO center style={{ color: Colors.$textWarning }}>
        {t('offline.banner')}
      </Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 8,
    zIndex: 100,
  },
});
