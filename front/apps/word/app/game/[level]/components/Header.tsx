import React from 'react';
import { View, Text, Image } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { colors, GAME_LIFE, QUESTION_TIMER, colorStatus } from '../../../../constants';
import { useGameContext } from '../../../../providers/game.provider';

export default function Header({ timer }: { timer: number }) {
  const GameContext = useGameContext();
  return (
    <>
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginVertical: 10 }}>
          {Array.from(Array(GameContext.problems.length).keys()).map((k) => (
            <View
              key={`problems-gage-${k}`}
              style={{
                width: `${(1 / GameContext.problems.length) * 98}%`,
                height: 30,
                backgroundColor: colorStatus[GameContext.problems[k].status],
                borderTopLeftRadius: k === 0 ? 15 : 0,
                borderBottomLeftRadius: k === 0 ? 15 : 0,
                borderTopRightRadius: k === GameContext.problems.length - 1 ? 15 : 0,
                borderBottomRightRadius: k === GameContext.problems.length - 1 ? 15 : 0,
                borderLeftColor: k !== 0 ? '#fff' : 'transparent',
                borderLeftWidth: k !== 0 ? 1 : 0,
              }}>
              <Text style={{ lineHeight: 30, textAlign: 'center', color: '#fff', fontSize: 10, fontWeight: '900' }}>{k + 1}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        <AnimatedCircularProgress
          size={55}
          width={8}
          fill={(timer / QUESTION_TIMER) * 100}
          tintColor={colors.primary}
          backgroundColor={colors.primary + '75'}>
          {() => <Text style={{ color: colors.text, fontWeight: '900' }}>{timer}</Text>}
        </AnimatedCircularProgress>
        <View style={{ flexDirection: 'row' }}>
          {Array.from(Array(GAME_LIFE).keys()).map((k) => (
            <Image
              key={`life ${k}`}
              source={
                k < GameContext.life
                  ? require('../../../../assets/images/life.png')
                  : require('../../../../assets/images/lifeDisabled.png')
              }
              style={{ width: 40, height: 40 }}
            />
          ))}
        </View>
      </View>
    </>
  );
}
