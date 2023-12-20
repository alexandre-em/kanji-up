import React from 'react';
import { Image, View } from 'react-native';
import { router, useGlobalSearchParams } from 'expo-router';

import { Content } from 'kanji-app-ui';

import { levels } from 'constants';

import useGameLevel from './hook';
import { ContentInput, Header, Question } from './components';
import { Button, Dialog, Divider } from 'react-native-paper';
import { useGameContext } from 'providers/game.provider';
import { AnswerDetail } from 'components';

export default function GameLevel() {
  const GameContext = useGameContext();
  const { dialog, input, isWrong, timer, textAnimRef, handleChangeInput, handleSkip, handleValidate, handleNext, hideDialog } =
    useGameLevel();
  const { level } = useGlobalSearchParams();

  return (
    <Content header={{ title: `Level ${level}`, onBack: () => router.back() }}>
      <Header timer={timer} />

      <View style={{ justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
        <Question textAnimRef={textAnimRef} />

        <ContentInput
          input={input}
          error={isWrong}
          onSkip={handleSkip}
          onValidate={handleValidate}
          onChange={handleChangeInput}
        />
      </View>

      <Dialog visible={dialog} dismissable={false} onDismiss={hideDialog}>
        <Dialog.Title>Answer</Dialog.Title>
        <Dialog.Content>
          <Divider />
          <AnswerDetail item={GameContext.problems[GameContext.problems.indexOf(GameContext.current!) - 1]} />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleNext} mode="contained">
            Next
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Image
        source={levels[parseInt(level as string) - 1].image}
        style={{ position: 'absolute', zIndex: -10, objectFit: 'cover', height: '100%', width: '100%', opacity: 0.15 }}
      />
    </Content>
  );
}
