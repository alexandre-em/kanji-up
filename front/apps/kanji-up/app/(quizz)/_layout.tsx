import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Appbar, Button, Dialog, Paragraph, Portal } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { KanjiType } from 'kanji-app-types';

import global from 'styles/global';
import { RootState } from 'store';
import { evaluation } from 'store/slices';

type QuizzContextValues = { kanjis: KanjiType[]; onFinish: () => void };

const QuizzContext = createContext<QuizzContextValues>({
  kanjis: [],
  onFinish: () => {
    return;
  },
});

export const useQuizzContext = () => {
  return useContext(QuizzContext);
};

export default function Quizz() {
  const dispatch = useDispatch();
  const [message, setMessage] = useState({ title: '', content: '', component: undefined });
  const [dialog, setDialog] = useState<boolean>(false);
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const settingsState = useSelector((state: RootState) => state.settings);
  const evaluationState = useSelector((state: RootState) => state.evaluation);

  const handleConfirmFinish = React.useCallback(() => {
    setDialog(false);
    router.push('/home');
  }, [evaluationState]);

  const handleBack = React.useCallback(() => {
    dispatch(evaluation.actions.reset({ time: settingsState.evaluationTime, totalCard: settingsState.evaluationCardNumber }));
    router.push('/home');
  }, []);

  const sKanji = useMemo(() => Object.values(kanjiState.selectedKanji), [kanjiState]);

  const dialogComponent = useMemo(
    () => (
      <Portal>
        <Dialog
          style={{ maxWidth: 700, maxHeight: 500, width: '100%', alignSelf: 'center' }}
          visible={dialog}
          onDismiss={() => {
            setDialog(false);
            router.replace('/home');
          }}>
          <Dialog.Title>{message.title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{message.content}</Paragraph>
            {message && message.component}
          </Dialog.Content>
          <Dialog.Actions style={{ flexWrap: 'wrap' }}>
            <Button mode="contained" onPress={handleConfirmFinish}>
              Finish
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    ),
    [dialog, message]
  );

  useEffect(() => {
    if (Object.keys(kanjiState.selectedKanji).length < 1) {
      setMessage({
        title: `Warning`,
        content: 'No kanji have been selected',
        component: undefined,
      });
      setDialog(true);
    }
  }, [kanjiState]);

  return (
    <QuizzContext.Provider value={{ kanjis: sKanji, onFinish: handleConfirmFinish }}>
      <View style={global.main}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title="Quizz" titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
        </Appbar.Header>
        <Stack>
          <Stack.Screen
            name="evaluation/index"
            options={{
              // Hide the header for all other routes.
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="flashcard/index"
            options={{
              // Hide the header for all other routes.
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              // Set the presentation mode to modal for our modal route.
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
        {dialogComponent}
      </View>
    </QuizzContext.Provider>
  );
}
