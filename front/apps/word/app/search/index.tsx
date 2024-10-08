import axios, { AxiosResponse } from 'axios';
import { router, useGlobalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { ActivityIndicator, DataTable, Divider, List, Searchbar, Surface } from 'react-native-paper';

import core from 'kanji-app-core';
import { Pagination, WordType } from 'kanji-app-types';
import { Content, globalStyle } from 'kanji-app-ui';

import styles from './style';
import { colors } from '../../constants/Colors';
import Searching from '../../svg/Searching';

const numberOfItemsPerPageList = [30, 50, 100, 200];

export default function Search() {
  const { search, access_token } = useGlobalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchInput, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(30);
  const [result, setResult] = useState<Pagination<WordType>>();

  const handleSubmit = useCallback(
    async ({ pge } = { pge: 1 }, customSearch?: string) => {
      if ((customSearch && customSearch !== '') || (searchInput && searchInput !== '')) {
        setLoading(true);
        const cancelToken = axios.CancelToken.source();
        const handleError = (err: Error) => console.log(err);
        try {
          await core
            .wordService!.search({ query: customSearch || searchInput, page: pge, limit }, { cancelToken: cancelToken.token })
            .then((res: AxiosResponse<Pagination<WordType>>) => {
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
    [searchInput, limit, access_token]
  );

  useEffect(() => {
    if (search) {
      setSearch(search as string);
      handleSubmit({ pge: page + 1 }, search as string);
    }
  }, [search, page]);

  return (
    <Content header={{ title: `Searching for ${searchInput}...`, onBack: () => router.back() }}>
      <Surface style={[styles.surface, styles.search]} elevation={5}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearch}
          value={searchInput}
          style={globalStyle(colors).search}
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
              {result.docs.map((w, i) => (
                <View key={w.word_id || i}>
                  <List.Item
                    title={w.word?.join(', ')}
                    description={w.reading?.join(', ')}
                    left={(props) => (
                      <Text {...props} style={styles.icon}>
                        {w.word[0]?.charAt(0) || w.reading[0].charAt(0)}
                      </Text>
                    )}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => router.push(`/word/${w.word_id}${access_token ? `?access_token=${access_token}` : ''}`)}
                  />
                  {i < result.docs.length - 1 && <Divider />}
                </View>
              ))}
            </ScrollView>
            <DataTable.Pagination
              page={page || 0}
              numberOfPages={result?.totalPages || 0}
              onPageChange={(pge) => setPage(pge)}
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
            <Text style={globalStyle(colors).title}>No input</Text>
          </View>
        )}
      </Surface>
    </Content>
  );
}
