import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Text } from 'react-native-ui-lib';

import { useIsOffline } from '../providers/network';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const isOffline = useIsOffline();
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <RNView style={[styles.banner, { top: insets.top, backgroundColor: Colors.$backgroundWarningLight }]}>
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
