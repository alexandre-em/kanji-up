import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import AccountSummary from './accountSummary';
import LanguageSelector from './languageSelector';

export default function Settings() {
  const { t } = useTranslation();

  return (
    <Layout screen="settings" withTabBar withBanner>
      <AccountSummary />
      <Spacing y={28} />
      <Text text70BO>{t('settings.section.preferences')}</Text>
      <Spacing y={12} />
      <LanguageSelector />
      <Spacing y={16} />
      <RNView style={styles.themeRow}>
        <Text text80M>{t('settings.theme.title')}</Text>
        <Text text90M $textNeutral>
          {t('settings.theme.comingSoon')}
        </Text>
      </RNView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.$outlineNeutral,
    opacity: 0.5,
  },
});
