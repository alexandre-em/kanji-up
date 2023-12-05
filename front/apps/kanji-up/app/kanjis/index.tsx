import React, { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Divider, IconButton, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { router, useLocalSearchParams } from 'expo-router';

import KanjiListComponent from './KanjiList';
import { colors } from '../../constants/Colors';
import { RootState } from '../../store';
import CustomDialog from '../../components/CustomDialog';
import { kanji } from 'store/slices';
import { KanjiType } from 'kanji-app-types';
import { fileNames, writeFile } from 'services/file';
import { Content } from 'kanji-app-ui';

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

  const headerRightComponent = useMemo(
    () => (
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
    ),
    [visible, handleCloseMenu, handleShowMenu, handleSelect, handleCancel, handleReset, handleSave]
  );

  return (
    <Content
      header={{
        title: `Grade: ${grade}`,
        style: { backgroundColor: selectionMode ? colors.secondary : colors.primary },
        right: headerRightComponent,
        onBack: handleBack,
      }}>
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
    </Content>
  );
}
