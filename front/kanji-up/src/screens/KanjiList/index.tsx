import React, {useEffect, useMemo} from 'react';
import {Platform, ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {ActivityIndicator, Appbar, DataTable, Divider, IconButton, Menu, Surface} from 'react-native-paper';
import {useSelector} from 'react-redux';

import styles from './style';
import {colors} from '../../constants';
import {KanjiListProps} from '../../types/screens';
import {RootState} from '../../store';
import CustomDialog from '../../components/CustomDialog';
import useHandlers from './useHandlers';
import useAuth from '../../hooks/useAuth';

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';
const numberOfItemsPerPageList = [30, 50, 100, 200];

export default function KanjiList({ navigation, route }: KanjiListProps) {
  const { grade } = route.params;
  const kanjiState = useSelector((s: RootState) => s.kanji);
  const { data, loading, selectionMode, setLimit, visible, dialog,
    getKanjis, handleBack, handleSave, handlePress, handleReset,
    handleSelect, handleCancel, handleShowMenu, handleCloseMenu, handleCloseDialog,
  } = useHandlers({ navigation, grade });
  const { isConnected } = useAuth();

  const surfaceStyle = React.useCallback((kanjiId: string) => {
    if (kanjiState.toRemove[kanjiId]) { return { backgroundColor: colors.warning, color: '#fff' }; }
    if (kanjiState.toAdd[kanjiId]) { return { backgroundColor: colors.info, color: '#fff' }; }
    if (kanjiState.selectedKanji[kanjiId]) { return { backgroundColor: '#ebebeb', color: '#fff' }; }
  }, [kanjiState]);

  const content = useMemo(() => {
    if (!data || loading) {
      return (
        <View style={[styles.main, { justifyContent: 'center', alignItems: 'center' }]} >
          <ActivityIndicator animating color={colors.primary} />
        </View>
      )
    }
    return (
      <ScrollView>
        <View style={styles.grid}>{
          data.docs.map((k) => (
            <TouchableOpacity key={k.kanji?.character_id} onPress={() => handlePress(k)}>
              <Surface style={[styles.kanjiSurface, surfaceStyle(k.kanji_id)]} elevation={4}>
                <Text style={styles.kanjiText}>{k.kanji?.character}</Text>
              </Surface>
            </TouchableOpacity>
          ))
        }</View>
    </ScrollView>
  )
  }, [data, loading, selectionMode, kanjiState]);

  useEffect(() => {
    if (isConnected === false) {
      navigation.navigate('Home');
    }
  }, [isConnected]);

  return (
    <View style={styles.main}>
      <Appbar.Header style={{ backgroundColor: selectionMode ? colors.secondary : colors.primary }}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={`Grade: ${grade}`} subtitle="Click on the right menu to switch to selection mode and don't forget to save your modification." titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
        <Menu
          visible={visible}
          onDismiss={handleCloseMenu}
          anchor={<IconButton onPress={handleShowMenu} icon={MORE_ICON} color="#fff" />}
        >
          <Menu.Item onPress={handleSelect} title={!selectionMode ? 'Selection mode' : 'Close selection mode'} />
          <Divider />
          <Menu.Item onPress={handleCancel} title="Cancel selection" />
          <Menu.Item onPress={handleReset} title="Reset selection" />
          <Menu.Item onPress={handleSave} title="Save modification" />
        </Menu>
      </Appbar.Header>
      <CustomDialog
        visible={dialog}
        message={{ title: 'Before quitting', description: 'Do you want to save your selection ?' }}
        onDismiss={handleCloseDialog}
        actions={[true, true]}
        onSave={() => { handleSave(); navigation.goBack(); }}
        onCancel={() => { handleCancel(); navigation.goBack(); } }
      />
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
  </View>
);
};
