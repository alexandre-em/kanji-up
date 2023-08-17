import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView, Text } from 'react-native';
import { ActivityIndicator, Appbar, DataTable, Divider, List, Searchbar, Surface } from 'react-native-paper';
import axios, { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import { router, useGlobalSearchParams } from 'expo-router';

import core from 'kanji-app-core';
import { KanjiType, Pagination } from 'kanji-app-types';

import styles from './style';
import { error } from '../../store/slices';
import { colors } from 'constants/Colors';
import Searching from '../../svg/Searching';
import global from 'styles/global';

const numberOfItemsPerPageList = [30, 50, 100, 200];

export default function Search() {
  const dispatch = useDispatch();
  const { search, access_token } = useGlobalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchInput, setSearch] = useState<string>('');
  const [limit, setLimit] = useState<number>(30);
  const [result, setResult] = useState<Pagination<KanjiType>>();

  const handleSubmit = useCallback(
    async ({ page } = { page: 1 }, customSearch?: string) => {
      if (customSearch && customSearch !== '') {
        setSearch(customSearch);
      }
      if (search && search !== '' && searchInput && searchInput !== '') {
        setLoading(true);
        const cancelToken = axios.CancelToken.source();
        const handleError = (err: Error) =>
          dispatch(
            error.actions.update({ message: axios.isCancel(err) ? 'Previous action cancelled.' : (err as Error).message })
          );
        try {
          await core
            .kanjiService!.search(
              { query: customSearch || searchInput, page, limit },
              { cancelToken: cancelToken.token, headers: { Authorization: `Bearer ${access_token}` } }
            )
            .then((res: AxiosResponse<Pagination<KanjiType>>) => {
              setResult(res.data);
              setLoading(false);
            })
            .catch(handleError);
        } catch (err) {
          handleError(err as Error);
        }

        return () => {
          cancelToken.cancel();
        };
      }

      return;
    },
    [searchInput, search, limit, access_token]
  );

  useEffect(() => {
    if (search) {
      handleSubmit({ page: 1 }, search as string);
    }
  }, [search]);

  return (
    <SafeAreaView style={global.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={`Searching for ${searchInput}...`}
          titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }}
        />
      </Appbar.Header>

      <Surface style={[styles.surface, styles.search]} elevation={5}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearch}
          value={searchInput}
          style={global.search}
          inputStyle={{ color: colors.text, fontSize: 15 }}
          onIconPress={() => handleSubmit()}
          onSubmitEditing={() => handleSubmit()}
          loading={loading}
        />
      </Surface>

      <Surface style={[styles.surface, { flex: 0.95, alignItems: 'center', justifyContent: 'center' }]} elevation={1}>
        {result && !loading ? (
          <View style={styles.content}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Results ({result.totalDocs})</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {result.docs.map((k, i) => (
                <View key={k.kanji_id || i}>
                  <List.Item
                    title={k.kanji?.meaning}
                    description={`${k.kanji?.onyomi?.join(',')}/${k.kanji?.kunyomi?.join(',')}`}
                    left={(props) => (
                      <Text {...props} style={styles.icon}>
                        {k.kanji?.character}
                      </Text>
                    )}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => router.push(`/kanji/${k.kanji_id}${access_token ? `?access_token=${access_token}` : ''}`)}
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
        ) : loading ? (
          <View>
            <ActivityIndicator animating size={50} />
          </View>
        ) : (
          <View>
            <Searching width={200} height={200} />
            <Text style={global.title}>No input</Text>
          </View>
        )}
      </Surface>
    </SafeAreaView>
  );
}
