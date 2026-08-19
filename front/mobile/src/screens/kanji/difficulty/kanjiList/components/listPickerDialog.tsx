import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Button, Colors, Icon, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../../../../components/spacing';
import { screenNames } from '../../../../../constants/screens';

const { Dialog } = Incubator;
const LIST_MAX_HEIGHT = 340;

type ListPickerDialogProps = {
  visible: boolean;
  lists: SelectionList[];
  activeListId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

// Shared between ActiveListSelector's persistent row (kanjiList grid) and the kanji detail
// screen's on-demand prompt (Select button, when reached from Search/Word detail with no active
// list set yet) — same picker, different triggers
export default function ListPickerDialog({ visible, lists, activeListId, onSelect, onClose }: ListPickerDialogProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleGoCreateList = () => {
    onClose();
    navigation.navigate(screenNames.MY_LISTS);
  };

  return (
    <Dialog visible={visible} onDismiss={onClose} bottom useSafeArea width="100%">
      <RNView style={[styles.sheet, { backgroundColor: Colors.$backgroundDefault }]}>
        {lists.length === 0 ? (
          <>
            <Text text70BO $textDefault>
              {t('kanjiList.activeList.none.title')}
            </Text>
            <Spacing y={8} />
            <Text text80M $textNeutral>
              {t('kanjiList.activeList.none.subtitle')}
            </Text>
            <Spacing y={16} />
            <Button label={t('kanjiList.activeList.none.action')} onPress={handleGoCreateList} />
          </>
        ) : (
          <>
            <Text text70BO $textDefault>
              {t('kanjiList.activeList.choose')}
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
