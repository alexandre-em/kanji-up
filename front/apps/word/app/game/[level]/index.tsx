import React from 'react';
import { Image, View } from 'react-native';
import { router, useGlobalSearchParams } from 'expo-router';

import { Content } from 'kanji-app-ui';

import { levels } from 'constants';

import useGameLevel from './hook';
import { ContentInput, Header, Question } from './components';

export default function GameLevel() {
  const { input, isWrong, timer, textAnimRef, handleChangeInput, handleSkip, handleValidate } = useGameLevel();
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

      <Image
        source={levels[parseInt(level as string) - 1].image}
        style={{ position: 'absolute', zIndex: -10, objectFit: 'cover', height: '100%', width: '100%', opacity: 0.2 }}
      />
    </Content>
  );
}
