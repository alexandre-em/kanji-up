import React, {useEffect, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {ActivityIndicator, Appbar, Button, Dialog, Paragraph, Portal} from 'react-native-paper';
import axios, {AxiosResponse} from 'axios';

import styles from './style';
import Evaluate from './Evaluate';
import Practice from './Practice';
import {FlashcardProps} from '../../types/screens';
import {RootState} from '../../store';
import {kanjiService} from '../../service';
import usePrediction from '../../hooks/usePrediction';
import {error, evaluation as evaluationSlice} from '../../store/slices';

export default function Flashcard({ navigation, route }: FlashcardProps) {
  const { evaluation } = route.params;
  const dispatch = useDispatch();
  const model = evaluation && usePrediction();
  const kanjiState =  useSelector((state: RootState) => state.kanji);
  const settingsState =  useSelector((state: RootState) => state.settings);
  const [dialog, setDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState({ title: '', content: '', component: undefined });

  const handleFinish = React.useCallback(({ title, content, component }: { title: string, content: string, component: any }) => {
    setMessage({ title, content, component });
    setDialog(true);
  }, []);

  const handleConfirmFinish = React.useCallback(() => {
    // TODO: Save user result and points
    dispatch(evaluationSlice.actions.reset({ time: settingsState.evaluationTime, totalCard: settingsState.evaluationCardNumber }));
    navigation.goBack();
  }, []);

  const sKanji = React.useMemo(() => (
    Object.values(kanjiState.selectedKanji)
  ), [kanjiState]);

  useEffect(() => {
    if (Object.keys(kanjiState.selectedKanji).length < 1) {
      setMessage({ title: `Warning: no kanji` ,content: 'You havn\'t selected kanji to start a flashcard session', component: undefined });
      setDialog(true);
    }
  }, [kanjiState]);

  useEffect(() => {
    (async () => {
      if (model && !model.model && evaluation && !loading) {
        setLoading(true);
        try {
          await model.loadModel();
        } catch (err: any) {
          dispatch(error.actions.update(err.message));
        } finally {
          setLoading(false);
        }
      }
    })()
  }, [model, evaluation, loading]);

  const dialogComponent = React.useMemo(() => (
    <Portal>
      <Dialog style={{ maxWidth: 700, width: '100%', alignSelf: 'center' }} visible={dialog} onDismiss={() => setDialog(false)}>
        <Dialog.Title>{message.title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{message.content}</Paragraph>
          {message && message.component}
        </Dialog.Content>
        <Dialog.Actions style={{ flexWrap: 'wrap' }}>
          <Button mode="contained" onPress={handleConfirmFinish}>Finish</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  ), [dialog, message]);

  return (<SafeAreaView style={styles.main}>
    <Appbar.Header>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title={`Flashcard`} titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
    </Appbar.Header>
    {evaluation ?
    (model.model
      ? <Evaluate kanji={sKanji} model={model} onFinish={handleFinish} />
      : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator  animating /></View>)
      : <Practice kanji={sKanji} onFinish={handleFinish} />
    }
    {dialogComponent}
  </SafeAreaView>)
};
