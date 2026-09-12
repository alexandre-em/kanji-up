import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { useIsOffline } from '../providers/network';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const isOffline = useIsOffline();

  if (!isOffline) return null;

  return (
    <RNView style={[styles.banner, { backgroundColor: Colors.$backgroundWarningLight }]}>
      <Text text90BO center style={{ color: Colors.$textWarning }}>
        {t('offline.banner')}
      </Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: -20,
    paddingVertical: 8,
  },
});
