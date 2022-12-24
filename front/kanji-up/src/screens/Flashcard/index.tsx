import React, {useEffect} from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Appbar, Button, Dialog, Paragraph, Portal} from 'react-native-paper';

import styles from './style';
import Evaluate from './Evaluate';
import Practice from './Practice';
import {FlashcardProps} from '../../types/screens';
import usePrediction from '../../hooks/usePrediction';
import useHandlers from './useHandlers';
import useAuth from '../../hooks/useAuth';

export default function Flashcard({ navigation, route }: FlashcardProps) {
  const { evaluation } = route.params;
  const [dialog, setDialog] = React.useState<boolean>(false);
  const model = usePrediction();
  const { sKanji, message, handleFinish, handleConfirmFinish } = useHandlers({ model, evaluation, navigation, setDialog });
  const { isConnected } = useAuth();

  const dialogComponent = React.useMemo(() => (
    <Portal>
      <Dialog style={{ maxWidth: 700, maxHeight: 500, width: '100%', alignSelf: 'center' }} visible={dialog} onDismiss={() => { setDialog(false); navigation.navigate('Home'); } }>
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

  useEffect(() => {
    if (isConnected === false) {
      navigation.navigate('Home');
    }
  }, [isConnected]);

  return (<View style={styles.main}>
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
  </View>)
};
