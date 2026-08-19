import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Button, Colors, Icon, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../../../../components/spacing';
import { screenNames } from '../../../../../constants/screens';

const { Dialog } = Incubator;
const LIST_MAX_HEIGHT = 340;

type ActiveListSelectorProps = {
  lists: SelectionList[];
  activeList: SelectionList | undefined;
  onSelect: (id: string) => void;
};

export default function ActiveListSelector({ lists, activeList, onSelect }: ActiveListSelectorProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleGoCreateList = () => {
    navigation.navigate(screenNames.MY_LISTS);
  };

  if (lists.length === 0) {
    return (
      <RNView style={[styles.row, { borderColor: Colors.$outlineNeutral }]}>
        <RNView style={styles.emptyText}>
          <Text text80M $textDefault>
            {t('kanjiList.activeList.none.title')}
          </Text>
          <Text text90M $textNeutral>
            {t('kanjiList.activeList.none.subtitle')}
          </Text>
        </RNView>
        <Button label={t('kanjiList.activeList.none.action')} onPress={handleGoCreateList} size="xSmall" />
      </RNView>
    );
  }

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
          {t('kanjiList.activeList.label')}
        </Text>
        <Text text80BO $textPrimary numberOfLines={1}>
          {activeList?.name ?? t('kanjiList.activeList.choose')}
        </Text>
      </TouchableOpacity>
      <Dialog visible={isPickerVisible} onDismiss={() => setPickerVisible(false)} bottom useSafeArea width="100%">
        <RNView style={[styles.sheet, { backgroundColor: Colors.$backgroundDefault }]}>
          <Text text70BO $textDefault>
            {t('kanjiList.activeList.choose')}
          </Text>
          <Spacing y={12} />
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {lists.map((list) => {
              const isActive = list.id === activeList?.id;

              return (
                <TouchableOpacity
                  key={list.id}
                  style={[styles.option, { borderBottomColor: Colors.$outlineNeutral }]}
                  onPress={() => handleSelect(list.id)}
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
    gap: 12,
  },
  emptyText: {
    flex: 1,
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
