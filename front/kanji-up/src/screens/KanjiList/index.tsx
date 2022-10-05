import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity} from 'react-native';
import {Appbar, DataTable, Divider, IconButton, Menu, Surface} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {AxiosResponse} from 'axios';

import styles from './style';
import {kanjiService} from '../../service';
import colors from '../../constants/colors';
import {KanjiListProps} from '../../types/screens';
import {error} from '../../store/slices';

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';
const numberOfItemsPerPageList = [30, 50, 100, 200];

export default function KanjiList({ navigation, route }: KanjiListProps) {
  const { grade } = route.params;
  const dispatch = useDispatch();
  const [data, setData] = useState<Pagination<KanjiType> | null>(null);
  const [limit, setLimit] = useState<number>(30);
  const [selection, setSelection] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const handlePress = useCallback((kanjiId: string) => {
    if (selection) {
      console.log('Selection mode');
    } else {
      navigation.navigate('KanjiDetail', { id: kanjiId });
    }
  }, [selection]);
  
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
          data.docs.map(({ kanji, kanji_id }) => (
            <TouchableOpacity key={kanji?.character_id} onPress={() => handlePress(kanji_id)}>
              <Surface style={styles.kanjiSurface}>
                <Text style={styles.kanjiText}>{kanji?.character}</Text>
              </Surface>
            </TouchableOpacity>
          ))
        }</SafeAreaView>
    </ScrollView>
  )
  }, [data, loading]);

  return (
    <SafeAreaView style={styles.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Grade: ${grade}`} titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={<IconButton onPress={() => setVisible(true)} icon={MORE_ICON} color="#fff" />}
        >
          <Menu.Item onPress={() => {}} title="Item 1" />
          <Menu.Item onPress={() => {}} title="Item 2" />
          <Divider />
          <Menu.Item onPress={() => {}} title="Select" />
        </Menu>
      </Appbar.Header>
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

