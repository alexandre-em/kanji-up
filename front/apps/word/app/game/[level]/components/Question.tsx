import { View, Animated } from 'react-native';
import React, { useMemo } from 'react';

import { colors } from 'constants';
import { useGameContext } from 'providers/game.provider';

export default function Question({ textAnimRef }) {
  const GameContext = useGameContext();

  const question = useMemo(() => GameContext.current?.question.question.split(/【|】/), [GameContext.current]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'center' }}>
      <Animated.Text
        style={{
          fontSize: textAnimRef,
          fontFamily: 'ReggaeOne',
          color: colors.text,
          textAlign: 'center',
        }}>
        {question
          ?.filter((q, i) => i !== 1)
          .map((str, i) =>
            i === 1 ? (
              <>
                <Animated.Text
                  style={{
                    fontSize: textAnimRef,
                    fontFamily: 'ReggaeOne',
                    color: colors.warning,
                    textAlign: 'center',
                  }}>
                  {question[1]}
                </Animated.Text>
                {str}
              </>
            ) : (
              str
            )
          )}
      </Animated.Text>
    </View>
  );
}
