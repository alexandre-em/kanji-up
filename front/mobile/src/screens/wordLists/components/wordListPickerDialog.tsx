import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Button, Colors, Icon, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../../components/spacing';
import { screenNames } from '../../../constants/screens';

const { Dialog } = Incubator;
const LIST_MAX_HEIGHT = 340;

type WordListPickerDialogProps = {
  visible: boolean;
  lists: WordSelectionList[];
  activeListId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

// Mirrors ListPickerDialog (kanji), scoped to word lists — same on-demand-prompt trigger from the
// word detail screen's "add to list" button
export default function WordListPickerDialog({ visible, lists, activeListId, onSelect, onClose }: WordListPickerDialogProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleGoCreateList = () => {
    onClose();
    navigation.navigate(screenNames.MY_WORD_LISTS as never);
  };

  return (
    <Dialog visible={visible} onDismiss={onClose} bottom useSafeArea width="100%">
      <RNView style={[styles.sheet, { backgroundColor: Colors.$backgroundDefault }]}>
        {lists.length === 0 ? (
          <>
            <Text text70BO $textDefault>
              {t('wordLists.activeList.none.title')}
            </Text>
            <Spacing y={8} />
            <Text text80M $textNeutral>
              {t('wordLists.activeList.none.subtitle')}
            </Text>
            <Spacing y={16} />
            <Button label={t('wordLists.activeList.none.action')} onPress={handleGoCreateList} />
          </>
        ) : (
          <>
            <Text text70BO $textDefault>
              {t('wordLists.activeList.choose')}
            </Text>
            <Spacing y={12} />
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {lists.map((list) => {
                const isActive = list.id === activeListId;

                return (
                  <TouchableOpacity
                    key={list.id}
                    style={[styles.option, { borderBottomColor: Colors.$outlineNeutral }]}
                    onPress={() => onSelect(list.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}>
                    <Text text80M style={{ color: isActive ? Colors.$textPrimary : Colors.$textDefault }}>
                      {list.name}
                    </Text>
                    {isActive && <Icon source={Assets.icons.check} size={18} tintColor={Colors.$iconPrimary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}
      </RNView>
    </Dialog>
  );
}

const styles = StyleSheet.create({
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
