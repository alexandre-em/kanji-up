import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { Content } from 'kanji-app-ui';
import core from 'kanji-app-core';

import { AnswerDetail } from '../../../../components';
import { SCORE_DATE_LIMIT, scoringByStatus } from '../../../../constants';
import { useGameContext } from '../../../../providers/game.provider';
import { RootState } from '../../../../store';
import { user } from '../../../../store/slices';

export default function Results() {
  const dispatch = useDispatch();
  const GameContext = useGameContext();
  const userState = useSelector((root: RootState) => root.user);

  const score = useMemo(
    () =>
      GameContext.problems.reduce(
        (prev, curr) => prev + scoringByStatus[curr.status] * (curr.status === 'invalid' ? 1 : parseInt(curr.question.level)),
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

  return (
    <Content header={{ title: `Results: ${score}pts`, onBack: handleFinish }}>
      <FlatList
        style={{ marginHorizontal: 20, marginBottom: 20 }}
        data={GameContext.problems}
        pagingEnabled
        renderItem={AnswerDetail}
        keyExtractor={(item) => item.question.question_id}
      />
      <Button style={{ margin: 5 }} onPress={handleFinish} mode="contained">
        Finish
      </Button>
    </Content>
  );
}
