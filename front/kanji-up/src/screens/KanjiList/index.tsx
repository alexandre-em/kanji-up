import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity} from 'react-native';
import {Appbar, Button, DataTable, Dialog, Divider, IconButton, Menu, Paragraph, Portal, Surface} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {AxiosResponse} from 'axios';

import styles from './style';
import {kanjiService} from '../../service';
import colors from '../../constants/colors';
import {KanjiListProps} from '../../types/screens';
import {error, kanji} from '../../store/slices';
import {RootState} from '../../store';
import {fileNames, writeFile} from '../../service/file';

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';
const numberOfItemsPerPageList = [30, 50, 100, 200];

export default function KanjiList({ navigation, route }: KanjiListProps) {
  const { grade } = route.params;
  const dispatch = useDispatch();
  const kanjiState = useSelector((s: RootState) => s.kanji);
  const [data, setData] = useState<Pagination<KanjiType> | null>(null);
  const [limit, setLimit] = useState<number>(30);
  const [selectionMode, setSelection] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);

  const handlePress = useCallback((selectedKanji: KanjiType) => {
    if (selectionMode) {
      if (kanjiState.toAdd[selectedKanji.kanji_id] || (kanjiState.selectedKanji[selectedKanji.kanji_id] && !kanjiState.toRemove[selectedKanji.kanji_id])) {
        dispatch(kanji.actions.unSelectKanji(selectedKanji));
      } else {
        dispatch(kanji.actions.selectKanji(selectedKanji));
      }
    } else {
      navigation.navigate('KanjiDetail', { id: selectedKanji.kanji_id });
    }
  }, [selectionMode, kanjiState]);

  const handleReset = useCallback(() => {
    dispatch(kanji.actions.reset());
  }, []);

  const handleCancel = useCallback(() => {
    dispatch(kanji.actions.cancel());
  }, []);

  const handleSave = useCallback(() => {
    dispatch(kanji.actions.save((selectedKanji: KanjiType) => writeFile(fileNames.SELECTED_KANJI, JSON.stringify(selectedKanji))));
  }, []);

  const handleBack = useCallback(() => {
    const hasModifs = Object.keys(kanjiState.toRemove).length + Object.keys(kanjiState.toAdd).length > 0;

    if (hasModifs) { setDialog(true); }
    else { navigation.goBack() }
  }, [kanjiState]);

  const surfaceStyle = useCallback((kanjiId: string) => {
    if (kanjiState.toRemove[kanjiId]) { return { backgroundColor: colors.warning, color: '#fff' }; }
    if (kanjiState.toAdd[kanjiId]) { return { backgroundColor: colors.info, color: '#fff' }; }
    if (kanjiState.selectedKanji[kanjiId]) { return { backgroundColor: '#ebebeb', color: '#fff' }; }
  }, [kanjiState]);
  
  const getKanjis = useCallback(({ page }) => {
    if (!loading) {
      setLoading(true);
      kanjiService
        .getKanjis({ grade, limit, page: page ?? {} })
        .then((res: AxiosResponse<Pagination<KanjiType>>) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => dispatch(error.actions.update(err.message)));
    }
  }, [limit, loading]);

  useEffect(() => {
    getKanjis({ limit, page: 1 });
  }, [limit]);

  const content = useMemo(() => {
    if (!data || loading) {
      return (
        <SafeAreaView style={[styles.main, { justifyContent: 'center', alignItems: 'center' }]} >
          <ActivityIndicator animating color={colors.primary} />
        </SafeAreaView>
      )
    }
    return (
      <ScrollView>
        <SafeAreaView style={styles.grid}>{
          data.docs.map((k) => (
            <TouchableOpacity key={k.kanji?.character_id} onPress={() => handlePress(k)}>
              <Surface style={[styles.kanjiSurface, surfaceStyle(k.kanji_id)]}>
                <Text style={styles.kanjiText}>{k.kanji?.character}</Text>
              </Surface>
            </TouchableOpacity>
          ))
        }</SafeAreaView>
    </ScrollView>
  )
  }, [data, loading, selectionMode, kanjiState]);

  const saveWarning = useMemo(() => (
    <Portal>
      <Dialog visible={dialog} onDismiss={() => setDialog(false)}>
        <Dialog.Title>Before quitting</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Do you want to save your selection ?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions style={{ flexWrap: 'wrap' }}>
          <Button onPress={() => { handleCancel(); navigation.goBack(); }}>Don't save</Button>
          <Button mode="contained" onPress={() => { handleSave(); navigation.goBack(); }}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  ), [dialog, kanjiState]);

  return (
    <SafeAreaView style={styles.main}>
      <Appbar.Header style={{ backgroundColor: selectionMode ? colors.secondary : colors.primary }}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={`Grade: ${grade}`} subtitle="Click on the right menu to switch to selection mode and don't forget to save your modification." titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={<IconButton onPress={() => setVisible(true)} icon={MORE_ICON} color="#fff" />}
        >
          <Menu.Item onPress={() => { setSelection((prevState: boolean) => !prevState); }} title={!selectionMode ? 'Selection mode' : 'Close selection mode'} />
          <Divider />
          <Menu.Item onPress={handleCancel} title="Cancel selection" />
          <Menu.Item onPress={handleReset} title="Reset selection" />
          <Menu.Item onPress={handleSave} title="Save modification" />
        </Menu>
      </Appbar.Header>
      {saveWarning}
      {content}
      <DataTable.Pagination
        page={data?.page || 1}
        numberOfPages={data?.totalPages || 0}
        onPageChange={(page) => getKanjis({ page })}
        showFastPaginationControls
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={data?.limit}
        onItemsPerPageChange={setLimit}
        selectPageDropdownLabel={'Max'}
      />

  </SafeAreaView>
);
};

