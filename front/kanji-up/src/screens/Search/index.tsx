import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, SafeAreaView, Text, } from 'react-native';
import { ActivityIndicator, Appbar, DataTable, Dialog, Divider, IconButton, List, Paragraph, Portal, Searchbar, Surface } from 'react-native-paper';
import axios, {AxiosResponse} from 'axios';
import {useDispatch} from 'react-redux';

import styles from './style';
import {kanjiService} from '../../service';
import {error} from '../../store/slices';
import {SearchProps} from '../../types/screens';
import colors from '../../constants/colors';
import Searching from '../../svg/Searching';

const numberOfItemsPerPageList = [30, 50, 100, 200];

export default function Search({ navigation, route }: SearchProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [limit, setLimit] = useState<number>(30);
  const [result, setResult] = useState<Pagination<KanjiType>>();

  const handleSubmit = useCallback(async ({ page }={ page: 1 }, customSearch=null) => {
    if (customSearch) { setSearch(customSearch); }
    setLoading(true);
    const cancelToken = axios.CancelToken.source();
    const handleError = (err: Error) => dispatch(error.actions.update(axios.isCancel(err) ? 'Previous action cancelled.' : err.message));
    try {
      await kanjiService
        .searchKanjis({ query: customSearch || search, page, limit },{ cancelToken: cancelToken.token })
        .then((res: AxiosResponse<Pagination<KanjiType>>) => {
          setResult(res.data);
          setLoading(false);
        })
        .catch(handleError);
    } catch (err) {
      handleError(err as Error);
    }

    return () => { cancelToken.cancel(); }
  }, [search, limit]);

  const filterDialog = useMemo(() => (
    <Portal>
      <Dialog style={{ maxWidth: 700, width: '100%', alignSelf: 'center' }} visible={dialog} onDismiss={() => setDialog(false)}>
        <Dialog.Title>Search result settings</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Do you want to save your selection ?</Paragraph>
        </Dialog.Content>
      </Dialog>
    </Portal>
  ), [dialog]);

  useEffect(() => {
    if (route.params) {
      handleSubmit({ page: 1 }, route.params.search as any);
    }
  }, [route.params]);

  return (
    <SafeAreaView style={styles.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Searching for ${search}...`} titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
      </Appbar.Header>

      <Surface style={[styles.surface, styles.search]} elevation={5}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearch}
          value={search}
          style={{ width: '90%', borderRadius: 25 }}
          inputStyle={{ color: colors.text, fontSize: 15 }}
          onSubmitEditing={handleSubmit}
        />
        <IconButton style={{ backgroundColor: colors.secondary }} icon="filter-variant" onPress={() => setDialog(true)} color="#fff" />
      </Surface>

      <Surface style={[styles.surface, { flex: 0.95, alignItems: 'center', justifyContent: 'center' }]} elevation={5}>
        {result && !loading
          ? <View style={styles.content}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Results ({result.totalDocs})</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {result.docs.map((k, i) => (
                <View key={k.kanji_id || i}>
                  <List.Item
                    title={k.kanji?.meaning}
                    description={`${k.kanji?.onyomi?.join(',')}/${k.kanji?.kunyomi?.join(',')}`}
                    left={(props) => <Text {...props} style={styles.icon}>{k.kanji?.character}</Text>}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => navigation.navigate('KanjiDetail', { id: k.kanji_id })}
                  />
                  {i < result.docs.length - 1 && <Divider />}
                </View>
              ))}
            </ScrollView>
            <DataTable.Pagination
              page={result?.page || 1}
              numberOfPages={result?.totalPages || 0}
              onPageChange={(page) => handleSubmit({ page })}
              showFastPaginationControls
              numberOfItemsPerPageList={numberOfItemsPerPageList}
              numberOfItemsPerPage={result?.limit}
              onItemsPerPageChange={setLimit}
              selectPageDropdownLabel={'Max'}
            />
          </View>
          : loading
          ? <View><ActivityIndicator animating size={50} /></View>
          : <View>
            <Searching width={200} height={200} />
            <Text style={styles.title}>No input</Text>
          </View>
        }
      </Surface>

    {filterDialog}
  </SafeAreaView>
)
};
