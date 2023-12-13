import { router } from 'expo-router';
import { View, Text, FlatList } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Divider, Icon } from 'react-native-paper';

import { Content } from 'kanji-app-ui';
import core from 'kanji-app-core';

import { colors, colorStatus, iconsStatus, SCORE_DATE_LIMIT, scoringByStatus } from 'constants';
import { useGameContext } from 'providers/game.provider';
import { RootState } from 'store';
import { user } from 'store/slices';

export default function Results() {
  const dispatch = useDispatch();
  const GameContext = useGameContext();
  const userState = useSelector((root: RootState) => root.user);

  const score = useMemo(
    () =>
      GameContext.problems.reduce(
        (prev, curr) => prev + scoringByStatus[curr.status] * (curr.status === 'invalid' ? 0 : parseInt(curr.question.level)),
        0
      ),
    [GameContext.problems]
  );

  const handleFinish = useCallback(() => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    const updatedUserScore = Object.keys(userState.scores)
      .filter((d) => {
        const date = new Date();
        const limit = new Date(date.setDate(date.getDate() - SCORE_DATE_LIMIT));

        return new Date(d) > limit;
      })
      .reduce((prev, curr) => ({ ...prev, [curr]: userState.scores[curr] }), {});

    updatedUserScore[formattedDate] = (userState.dailyScore || 0) + score;

    core.userService?.updateUserScore(
      {
        total_score: userState.totalScore + score,
        scores: updatedUserScore,
        progression: userState.progression,
      },
      'word'
    );

    dispatch(user.actions.addScoreDaily(score));

    router.push('/home');
  }, [score, userState]);

  const renderItem = useCallback(({ item }: { item: ProblemType }) => {
    const question = item.question.question.split(/【|】/);

    return (
      <View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 0.4, borderRightWidth: 1, borderRightColor: colors.text }}>
            <Text
              style={{
                fontSize: 30,
                fontFamily: 'ReggaeOne',
                color: colors.text,
                textAlign: 'center',
              }}>
              {question
                ?.filter((q, i) => i !== 1)
                .map((str, i) =>
                  i === 1 ? (
                    <>
                      <Text
                        style={{
                          fontSize: 30,
                          fontFamily: 'ReggaeOne',
                          color: colors.warning,
                          textAlign: 'center',
                        }}>
                        {question[1]}
                      </Text>
                      {str}
                    </>
                  ) : (
                    str
                  )
                )}
            </Text>
          </View>
          <View style={{ flex: 0.6, margin: 5 }}>
            <Text
              style={{
                color: colors.secondaryDark,
                textAlign: 'center',
                fontSize: 20,
                fontWeight: '700',
              }}>
              <Icon source={iconsStatus[item.status]} color={colorStatus[item.status]} size={20} />
              {item.question.answer}
            </Text>
            <Divider style={{ opacity: 0.5 }} />
            <View>
              {item.question.meaning?.map((meaning, i) => (
                <>
                  <Text>{meaning}</Text>
                  {i + 1 < (item.question.meaning?.length || 0) && <Divider style={{ opacity: 0.3 }} />}
                </>
              ))}
            </View>
          </View>
        </View>
        <Divider />
      </View>
    );
  }, []);

  return (
    <Content header={{ title: `Results: ${score}pts`, onBack: handleFinish }}>
      <FlatList
        style={{ marginHorizontal: 20, marginBottom: 20 }}
        data={GameContext.problems}
        pagingEnabled
        renderItem={renderItem}
        keyExtractor={(item) => item.question.question_id}
      />
      <Button style={{ margin: 5 }} onPress={handleFinish} mode="contained">
        Finish
      </Button>
    </Content>
  );
}
