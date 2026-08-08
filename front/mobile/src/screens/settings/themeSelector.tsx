import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Colors, Icon, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../components/spacing';
import { ThemePreference, useThemePreference } from '../../providers/theme';
import { useToaster } from '../../providers/toaster';

const { Dialog } = Incubator;
const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export default function ThemeSelector() {
  const { t } = useTranslation();
  const toast = useToaster();
  const { preference, setPreference } = useThemePreference();
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleSelect = (next: ThemePreference) => {
    setPickerVisible(false);
    if (next === preference) return;
    setPreference(next);
    toast?.show({ message: t('settings.theme.toast'), type: 'success' });
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.row, { borderColor: Colors.$outlineNeutral }]}
        onPress={() => setPickerVisible(true)}
        accessibilityRole="button">
        <Text text80M $textDefault>
          {t('settings.theme.title')}
        </Text>
        <Text text80M $textNeutral>
          {t(`settings.theme.${preference}`)}
        </Text>
      </TouchableOpacity>
      <Dialog visible={isPickerVisible} onDismiss={() => setPickerVisible(false)} bottom useSafeArea width="100%">
        <RNView style={[styles.sheet, { backgroundColor: Colors.$backgroundDefault }]}>
          <Text text70BO $textDefault>
            {t('settings.theme.choose')}
          </Text>
          <Spacing y={12} />
          {THEME_OPTIONS.map((option) => {
            const isActive = option === preference;

            return (
              <TouchableOpacity
                key={option}
                style={[styles.option, { borderBottomColor: Colors.$outlineNeutral }]}
                onPress={() => handleSelect(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}>
                <Text text80M style={{ color: isActive ? Colors.$textPrimary : Colors.$textDefault }}>
                  {t(`settings.theme.${option}`)}
                </Text>
                {isActive && <Icon source={Assets.icons.check} size={18} tintColor={Colors.$iconPrimary} />}
              </TouchableOpacity>
            );
          })}
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
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
