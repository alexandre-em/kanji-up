import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Appbar, Button, Dialog, Paragraph, Portal} from 'react-native-paper';

import styles from './style';
import Evaluate from './Evaluate';
import Practice from './Practice';
import {FlashcardProps} from '../../types/screens';
import {RootState} from '../../store';
import {kanjiService} from '../../service';
import axios, {AxiosResponse} from 'axios';
import {error} from '../../store/slices';

export default function Flashcard({ navigation, route }: FlashcardProps) {
  const { evaluation } = route.params;
  const dispatch = useDispatch();
  const kanjiState =  useSelector((state: RootState) => state.kanji);
  const [sKanji, setKanji] = useState<Array<KanjiType>>([]);
  const [dialog, setDialog] = useState<boolean>(false);
  const [message, setMessage] = useState({ title: '', content: '' });
  
  const dialogComponent = React.useMemo(() => (
    <Portal>
      <Dialog style={{ maxWidth: 700, width: '100%', alignSelf: 'center' }} visible={dialog} onDismiss={() => setDialog(false)}>
        <Dialog.Title>{message.title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{message.content}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions style={{ flexWrap: 'wrap' }}>
          <Button mode="contained" onPress={() => navigation.goBack()}>Finish</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  ), [dialog]);

  const handleFinish = React.useCallback(({ title, content }) => {
    setMessage({ title, content });
    setDialog(true);
  }, []);

  useEffect(() => {
    if (Object.keys(kanjiState.selectedKanji).length < 1) {
      setMessage({ title: `Warning: no kanji` ,content: 'You havn\'t selected kanji to start a flashcard session' });
      setDialog(true);
    }

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
    {evaluation
      ? <Evaluate kanji={sKanji} onFinish={handleFinish} />
      : <Practice kanji={sKanji} onFinish={handleFinish} />
    }
    {dialogComponent}
  </SafeAreaView>)
};

