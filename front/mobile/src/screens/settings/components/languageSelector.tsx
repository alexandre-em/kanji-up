import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Colors, Icon, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../../components/spacing';
import { SUPPORTED_LANGUAGES } from '../../../i18n';
import { useToaster } from '../../../providers/toaster';

const { Dialog } = Incubator;
// Caps the sheet's scroll area so it stays reachable by thumb even with 10+ languages,
// instead of growing to fill (and pushing the option list off-screen)
const LIST_MAX_HEIGHT = 340;

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const toast = useToaster();
  const [isPickerVisible, setPickerVisible] = useState(false);

  // i18n.language is a full device locale tag (e.g. "en-US", "fr-FR") until the user picks one
  // manually here — SUPPORTED_LANGUAGES and every settings.language.<code> key only know the base
  // code, so looking either up with the raw tag silently misses (label falls back to the raw key,
  // and the picker's checkmark never lands on any option on first launch)
  const currentLanguageCode = SUPPORTED_LANGUAGES.find((code) => i18n.language.startsWith(code)) ?? SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: string) => {
    setPickerVisible(false);
    if (code === currentLanguageCode) return;
    i18n.changeLanguage(code);
    toast?.show({ message: t('settings.language.toast'), type: 'success' });
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.row, { borderColor: Colors.$outlineNeutral }]}
        onPress={() => setPickerVisible(true)}
        accessibilityRole="button">
        <Text text80M $textDefault>
          {t('settings.language.title')}
        </Text>
        <Text text80M $textNeutral>
          {t(`settings.language.${currentLanguageCode}`)}
        </Text>
      </TouchableOpacity>
      <Dialog visible={isPickerVisible} onDismiss={() => setPickerVisible(false)} bottom useSafeArea width="100%">
        <RNView style={[styles.sheet, { backgroundColor: Colors.$backgroundDefault }]}>
          <Text text70BO $textDefault>
            {t('settings.language.choose')}
          </Text>
          <Spacing y={12} />
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {SUPPORTED_LANGUAGES.map((code) => {
              const isActive = code === currentLanguageCode;

              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.option, { borderBottomColor: Colors.$outlineNeutral }]}
                  onPress={() => handleSelect(code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}>
                  <Text text80M style={{ color: isActive ? Colors.$textPrimary : Colors.$textDefault }}>
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
  },
  sheet: {
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
  },
});
