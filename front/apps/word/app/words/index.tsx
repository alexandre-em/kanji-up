import { Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Content } from 'kanji-app-ui';
import { router } from 'expo-router';
import { Pagination, WordType } from 'kanji-app-types';
import axios from 'axios';
import core from 'kanji-app-core';
import { error } from 'store/slices';
import { useDispatch } from 'react-redux';
import { DataTable, Divider, List } from 'react-native-paper';
import { colors } from 'constants';
import { ScrollView } from 'react-native-gesture-handler';

import styles from './style';

const numberOfItemsPerPageList = [30, 50, 100, 200];

export default function Words() {
  const dispatch = useDispatch();
  const [words, setWords] = useState<Pagination<WordType> | undefined>();
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(numberOfItemsPerPageList[0]);

  const handlePaginatedWordList = useCallback(
    (pge = 1) => {
      const cancelToken = axios.CancelToken.source();

      if (core && core.wordService) {
        core.wordService
          .getAll({ page: pge, limit }, { cancelToken: cancelToken.token })
          .then((res) => setWords(res.data))
          .catch((err) =>
            dispatch(error.actions.update({ message: axios.isCancel(err) ? 'Previous action cancelled.' : err.message }))
          );
      }

      return () => {
        cancelToken.cancel();
      };
    },
    [limit]
  );

  useEffect(() => {
    handlePaginatedWordList(page + 1);
  }, [page]);

  if (!words?.totalDocs) {
    return null;
  }

  return (
    <Content header={{ title: 'List of Words', onBack: () => router.back() }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '900', margin: 15 }}>Total words: {words?.totalDocs}</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {words.docs.map((w, i) => (
          <View key={w.word_id || i} style={{ marginHorizontal: 15 }}>
            <List.Item
              title={w.word?.join(', ')}
              description={w.reading?.join(', ')}
              left={(props) => (
                <Text {...props} style={styles.icon}>
                  {w.word[0]?.charAt(0) || w.reading[0].charAt(0)}
                </Text>
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push(`/word/${w.word_id}`)}
            />
            {i < words.docs.length - 1 && <Divider />}
          </View>
        ))}
      </ScrollView>
      <DataTable.Pagination
        page={page || 0}
        numberOfPages={words?.totalPages || 0}
        onPageChange={(pge) => setPage(pge)}
        showFastPaginationControls
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={words?.limit}
        onItemsPerPageChange={setLimit}
        selectPageDropdownLabel={'Max'}
      />
    </Content>
  );
}
