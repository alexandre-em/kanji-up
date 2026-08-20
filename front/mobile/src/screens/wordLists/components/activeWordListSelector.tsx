import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import WordListPickerDialog from './wordListPickerDialog';

type ActiveWordListSelectorProps = {
  lists: WordSelectionList[];
  activeList: WordSelectionList | undefined;
  onSelect: (id: string) => void;
};

// Mirrors ActiveListSelector (kanji), scoped to word lists
export default function ActiveWordListSelector({ lists, activeList, onSelect }: ActiveWordListSelectorProps) {
  const { t } = useTranslation();
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleSelect = (id: string) => {
    setPickerVisible(false);
    onSelect(id);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.row, { borderColor: Colors.$outlineNeutral }]}
        onPress={() => setPickerVisible(true)}
        accessibilityRole="button">
        <Text text80M $textNeutral>
          {t('wordLists.activeList.label')}
        </Text>
        <Text text80BO $textPrimary numberOfLines={1}>
          {activeList?.name ?? t('wordLists.activeList.choose')}
        </Text>
      </TouchableOpacity>
      <WordListPickerDialog
        visible={isPickerVisible}
        lists={lists}
        activeListId={activeList?.id}
        onSelect={handleSelect}
        onClose={() => setPickerVisible(false)}
      />
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
    gap: 12,
  },
});
