import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Colors, Icon, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../components/spacing';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { useToaster } from '../../providers/toaster';

const { Dialog } = Incubator;
// Caps the sheet's scroll area so it stays reachable by thumb even with 10+ languages,
// instead of growing to fill (and pushing the option list off-screen)
const LIST_MAX_HEIGHT = 340;

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const toast = useToaster();
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleSelect = (code: string) => {
    setPickerVisible(false);
    if (code === i18n.language) return;
    i18n.changeLanguage(code);
    toast?.show({ message: t('settings.language.toast'), type: 'success' });
  };

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={() => setPickerVisible(true)} accessibilityRole="button">
        <Text text80M>{t('settings.language.title')}</Text>
        <Text text80M $textNeutral>
          {t(`settings.language.${i18n.language}`)}
        </Text>
      </TouchableOpacity>
      <Dialog visible={isPickerVisible} onDismiss={() => setPickerVisible(false)} bottom useSafeArea width="100%">
        <RNView style={styles.sheet}>
          <Text text70BO>{t('settings.language.choose')}</Text>
          <Spacing y={12} />
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {SUPPORTED_LANGUAGES.map((code) => {
              const isActive = code === i18n.language;

              return (
                <TouchableOpacity
                  key={code}
                  style={styles.option}
                  onPress={() => handleSelect(code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}>
                  <Text text80M style={isActive ? { color: Colors.$textPrimary } : undefined}>
                    {t(`settings.language.${code}`)}
                  </Text>
                  {isActive && <Icon source={Assets.icons.check} size={18} tintColor={Colors.$iconPrimary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </RNView>
      </Dialog>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.$outlineNeutral,
  },
  sheet: {
    backgroundColor: Colors.$backgroundDefault,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  list: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.$outlineNeutral,
  },
});
