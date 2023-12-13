import { Href, router } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import React, { useCallback } from 'react';
import { Chip } from 'react-native-paper';

import { Content, GradientCard, globalStyle } from 'kanji-app-ui';

import { colors } from 'constants';

import style from './style';
import { GAME_MODE, levels } from 'constants/game';
import { useGameContext } from 'providers/game.provider';

export default function GameMenu() {
  const GameContext = useGameContext();

  const handleModeSelection = useCallback((mode: GameMode) => {
    switch (mode) {
      case 'onyomi':
        GameContext.setSelectedMode((prev: GameMode[]) =>
          prev.includes('onyomi') ? prev.filter((p) => p !== mode) : [...prev, mode]
        );
        break;
      case 'kunyomi':
        GameContext.setSelectedMode((prev: GameMode[]) =>
          prev.includes('kunyomi') ? prev.filter((p) => p !== mode) : [...prev, mode]
        );
        break;
      default:
        throw new Error('Invalid mode, must not happen');
    }
  }, []);

  const handleSelectLevel = useCallback(
    (item: (typeof levels)[0]) => {
      if (GameContext) {
        GameContext.initialize(item.id);

        router.push(item.screen as Href<string>);
      }
    },
    [GameContext]
  );

  return (
    <Content header={{ title: 'Game Menu', onBack: () => router.back() }}>
      <Text style={globalStyle(colors).title}>1. Select mode</Text>
      <ScrollView horizontal style={{ height: 100 }}>
        <View style={style.chipGroup}>
          {GAME_MODE.map((gMode) => (
            <Chip
              key={gMode}
              style={style.chip}
              selected={GameContext.selectedMode.includes(gMode)}
              textStyle={{ textTransform: 'capitalize' }}
              showSelectedOverlay
              showSelectedCheck={false}
              onPress={() => handleModeSelection(gMode)}>
              {gMode}
            </Chip>
          ))}
        </View>
      </ScrollView>
      <Text style={globalStyle(colors).title}>2. Select difficulty</Text>
      <ScrollView>
        <View style={style.menu}>
          {levels.map((item) => (
            <GradientCard
              key={item.title}
              onPress={() => handleSelectLevel(item)}
              image={item.image}
              title={item.title}
              subtitle={item.subtitle}
              buttonTitle={item.buttonTitle}
              disabled={GameContext.selectedMode.length <= 0}
            />
          ))}
        </View>
      </ScrollView>
    </Content>
  );
}
