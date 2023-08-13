import React, { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Dialog, Paragraph, Portal } from 'react-native-paper';
import { useSelector } from 'react-redux';

import styles from './style';
import Evaluate from './Evaluate';
import Practice from './Practice';
import { FlashcardProps } from '../../types/screens';
import useHandlers from './useHandlers';
import useAuth from '../../hooks/useAuth';
import { RootState } from '../../store';

export default function Flashcard({ navigation, route }: FlashcardProps) {
  const { evaluation, model } = route.params;
  const { sKanji, message, dialog, handleFinish, handleConfirmFinish, setDialog } = useHandlers({ navigation });
  const { isConnected } = useAuth();
  const settingState = useSelector((state: RootState) => state.settings);

  const dialogComponent = React.useMemo(
    () => (
      <Portal>
        <Dialog
          style={{ maxWidth: 700, maxHeight: 500, width: '100%', alignSelf: 'center' }}
          visible={dialog}
          onDismiss={() => {
            setDialog(false);
            navigation.navigate('Home');
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

  const evaluationScreen = useMemo(() => {
    if (evaluation) {
      if (!settingState.useLocalModel || (model && model.model)) {
        return <Evaluate kanji={sKanji} model={model} onFinish={handleFinish} />;
      }

      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator animating />
        </View>
      );
    }
    return <Practice kanji={sKanji} onFinish={handleFinish} />;
  }, [evaluation, model, sKanji, handleFinish]);

  useEffect(() => {
    if (isConnected === false) {
      navigation.navigate('Home');
    }
  }, [isConnected]);

  if (settingState.useLocalModel && model && !model.model) {
    return (
      <View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating />
        <Text>Loading model...</Text>
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Flashcard" titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
      </Appbar.Header>
      {evaluationScreen}
      {dialogComponent}
    </View>
  );
}
