import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-ui-lib';

import AccountSummary from '../../components/accountSummary';
import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { screenNames } from '../../constants/screens';
import GoogleSignInButton from './components/googleSignIn';
import LanguageSelector from './components/languageSelector';
import ThemeSelector from './components/themeSelector';

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
      <Text text70BO $textDefault>
        {t('settings.section.preferences')}
      </Text>
      <Spacing y={12} />
      <LanguageSelector />
      <Spacing y={16} />
      <ThemeSelector />
    </Layout>
  );
}
