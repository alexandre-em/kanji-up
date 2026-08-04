import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import AccountSummary from '../../components/accountSummary';
import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { screenNames } from '../../constants/screens';
import GoogleSignInButton from './googleSignIn';
import LanguageSelector from './languageSelector';

export default function Settings() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <Layout screen="settings" withTabBar>
      <TouchableOpacity
        onPress={() => navigation.navigate(screenNames.PROFILE)}
        accessibilityRole="button"
        accessibilityLabel={t('settings.viewProfile')}>
        <AccountSummary />
      </TouchableOpacity>
      <Spacing y={20} />
      <GoogleSignInButton />
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
