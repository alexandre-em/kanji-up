import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { KanjiType } from 'kanji-app-types';
import { Content } from 'kanji-app-ui';

import KanjiListComponent from './KanjiList';
import CustomDialog from '../../components/CustomDialog';
import { colors } from '../../constants/Colors';
import { fileNames, writeFile } from '../../services/file';
import { RootState } from '../../store';
import { kanji } from '../../store/slices';

export default function KanjiList() {
  const dispatch = useDispatch();
  const { grade } = useLocalSearchParams();
  const [dialog, setDialog] = useState<boolean>(false);
  const [selectionMode, setSelection] = useState<boolean>(false);
  const kanjiState = useSelector((s: RootState) => s.kanji);

  const handleCloseDialog = useCallback(() => setDialog(false), []);

  const handleReset = useCallback(() => {
    dispatch(kanji.actions.reset());
  }, []);

  const handleCancel = useCallback(() => {
    dispatch(kanji.actions.cancel());
    setSelection(false);
  }, []);

  const handleSave = useCallback(() => {
    dispatch(
      kanji.actions.save((selectedKanji: KanjiType) => writeFile(fileNames.SELECTED_KANJI, JSON.stringify(selectedKanji)))
    );
    setSelection(false);
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
    () =>
      selectionMode ? (
        <View style={{ flexDirection: 'row' }}>
          <IconButton onPress={handleCancel} icon="close" mode="outlined" />
          <IconButton onPress={handleSave} icon="content-save" color="#fff" mode="contained" />
        </View>
      ) : (
        <View style={{ flexDirection: 'row' }}>
          <IconButton onPress={handleReset} icon="delete" />
          <IconButton onPress={() => setSelection(true)} icon="select-drag" color="#fff" mode="outlined" />
        </View>
      ),
    [selectionMode, handleCancel, handleReset, handleSave]
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
