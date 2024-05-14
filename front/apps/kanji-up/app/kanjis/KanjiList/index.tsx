import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, DataTable } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import core from 'kanji-app-core';
import { KanjiType, Pagination } from 'kanji-app-types';

import Surface from './Surface';
import styles from '../style';
import { colors } from '../../../constants/Colors';
import { RootState } from '../../../store';
import { error, kanji } from '../../../store/slices';
import global from '../../../styles/global';

const numberOfItemsPerPageList = [30, 50, 100, 200];

export default function KanjiList({ grade, selectionMode }: { grade: string; selectionMode: boolean }) {
  const dispatch = useDispatch();
  const [data, setData] = useState<Pagination<KanjiType> | null>(null);
  const [limit, setLimit] = useState<number>(30);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const kanjiState = useSelector((state: RootState) => state.kanji);

  const getKanjis = React.useCallback(
    ({ page }: { page: number }, options: AxiosRequestConfig = {}) => {
      if (!loading) {
        setLoading(true);
        core
          .kanjiService!.getAll({ grade, limit, page: page ?? {} }, options)
          .then((res: AxiosResponse<Pagination<KanjiType>>) => {
            setData(res.data);
            setLoading(false);
          })
          .catch((err) =>
            dispatch(error.actions.update({ message: axios.isCancel(err) ? 'Previous action cancelled.' : err.message }))
          );
      }
    },
    [limit, loading]
  );

  const handlePress = React.useCallback(
    (selectedKanji: KanjiType) => {
      if (selectionMode) {
        if (
          kanjiState.toAdd[selectedKanji.kanji_id] ||
          (kanjiState.selectedKanji[selectedKanji.kanji_id] && !kanjiState.toRemove[selectedKanji.kanji_id])
        ) {
          dispatch(kanji.actions.unSelectKanji(selectedKanji));
        } else {
          dispatch(kanji.actions.selectKanji(selectedKanji));
        }
      } else {
        router.push(`/kanji/${selectedKanji.kanji_id}`);
      }
    },
    [selectionMode, kanjiState]
  );

  React.useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    if (core && core.kanjiService) {
      getKanjis({ page: 1 }, { cancelToken: cancelToken.token });
    }

    return () => {
      cancelToken.cancel();
    };
  }, [grade]);

  React.useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    if (core && core.kanjiService) {
      getKanjis({ page }, { cancelToken: cancelToken.token });
    }

    return () => {
      cancelToken.cancel();
    };
  }, [limit, page]);

  if (!data || loading) {
    return (
      <View style={[global.main, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }
  return (
    <>
      <ScrollView>
        <View style={styles.grid}>
          {data.docs.map((k) => (
            <Surface key={k.kanji?.character_id} kanji={k} onPress={() => handlePress(k)} />
          ))}
        </View>
      </ScrollView>
      <DataTable.Pagination
        page={data?.page || 1}
        numberOfPages={data?.totalPages || 0}
        onPageChange={setPage}
        showFastPaginationControls
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={data?.limit}
        onItemsPerPageChange={setLimit}
        selectPageDropdownLabel={'Max'}
      />
    </>
  );
}
