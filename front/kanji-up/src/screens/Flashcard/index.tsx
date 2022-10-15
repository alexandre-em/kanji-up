import React, {useEffect, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Appbar} from 'react-native-paper';

import styles from './style';
import {FlashcardProps} from '../../types/screens';
import {RootState} from '../../store';
import Evaluate from './Evaluate';
import {kanjiService} from '../../service';
import axios, {AxiosResponse} from 'axios';
import {error, kanji} from '../../store/slices';
import Practice from './Practice';

export default function Flashcard({ navigation, route }: FlashcardProps) {
  // const { evaluation } = route.params;
  const dispatch = useDispatch();
  const kanjiState =  useSelector((state: RootState) => state.kanji);
  const [sKanji, setKanji] = useState<Array<KanjiType>>([]);
  
  useEffect(() => {
    const cancelToken = axios.CancelToken.source();

    const k = kanjiState.selectedKanji[Object.keys(kanjiState.selectedKanji)[0]];

    kanjiService
      .getKanjiDetail({ id: k.kanji_id }, { cancelToken: cancelToken.token })
      .then((res: AxiosResponse<KanjiType>) => setKanji((prev) => [...prev, res.data]))
      .catch((err) => dispatch(error.actions.update(axios.isCancel(err) ? 'Previous action cancelled.' : err.message)));

    return () => { cancelToken.cancel(); }
  }, [kanjiState]);

  return (<SafeAreaView style={styles.main}>
    <Appbar.Header>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title={`Flashcard`} titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
    </Appbar.Header>
    {false
      ? <Evaluate kanji={sKanji} />
      : <Practice kanji={sKanji} />
    }
  </SafeAreaView>)
};

