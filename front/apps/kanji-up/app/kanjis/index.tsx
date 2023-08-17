import React, { useCallback, useState } from 'react';
import { Platform, View } from 'react-native';
import { Appbar, Divider, IconButton, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { router, useLocalSearchParams } from 'expo-router';

import KanjiListComponent from './KanjiList';
import { colors } from '../../constants/Colors';
import { RootState } from '../../store';
import CustomDialog from '../../components/CustomDialog';
import { kanji } from 'store/slices';
import { KanjiType } from 'kanji-app-types';
import global from 'styles/global';
import { fileNames, writeFile } from 'services/file';

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

export default function KanjiList() {
  const dispatch = useDispatch();
  const { grade } = useLocalSearchParams();
  const [dialog, setDialog] = useState<boolean>(false);
  const [selectionMode, setSelection] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const kanjiState = useSelector((s: RootState) => s.kanji);

  const handleShowMenu = useCallback(() => setVisible(true), []);
  const handleCloseMenu = useCallback(() => setVisible(false), []);
  const handleCloseDialog = useCallback(() => setDialog(false), []);

  const handleSelect = useCallback(() => {
    setSelection((prevState: boolean) => !prevState);
  }, []);

  const handleReset = useCallback(() => {
    dispatch(kanji.actions.reset());
  }, []);

  const handleCancel = useCallback(() => {
    dispatch(kanji.actions.cancel());
  }, []);

  const handleSave = useCallback(() => {
    dispatch(
      kanji.actions.save((selectedKanji: KanjiType) => writeFile(fileNames.SELECTED_KANJI, JSON.stringify(selectedKanji)))
    );
  }, []);

  const handleBack = useCallback(() => {
    const hasModifs = Object.keys(kanjiState.toRemove).length + Object.keys(kanjiState.toAdd).length > 0;

    if (hasModifs) {
      setDialog(true);
    } else {
      router.back();
    }
  }, [kanjiState]);

  return (
    <View style={global.main}>
      <Appbar.Header style={{ backgroundColor: selectionMode ? colors.secondary : colors.primary }}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={`Grade: ${grade}`} titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
        <Menu
          visible={visible}
          onDismiss={handleCloseMenu}
          anchor={<IconButton onPress={handleShowMenu} icon={MORE_ICON} color="#fff" />}>
          <Menu.Item onPress={handleSelect} title={!selectionMode ? 'Selection mode' : 'Close selection mode'} />
          <Divider />
          <Menu.Item onPress={handleCancel} title="Cancel selection" />
          <Menu.Item onPress={handleReset} title="Reset selection" />
          <Menu.Item onPress={handleSave} title="Save modification" />
        </Menu>
      </Appbar.Header>

      <KanjiListComponent grade={`${grade}`} selectionMode={selectionMode} />

      <CustomDialog
        visible={dialog}
        message={{ title: 'Before quitting', description: 'Do you want to save your selection ?' }}
        onDismiss={handleCloseDialog}
        actions={[true, true]}
        onSave={() => {
          handleSave();
          router.back();
        }}
        onCancel={() => {
          handleCancel();
          router.back();
        }}
      />
    </View>
  );
}
