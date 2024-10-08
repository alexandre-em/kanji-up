import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Avatar, Button, Divider, IconButton, List } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import core from 'kanji-app-core';

import { KANJI_PROGRESSION_INC, KANJI_PROGRESSION_INC_LOW } from '../../constants';
import { colors } from '../../constants/Colors';
import { RootState } from '../../store';
import { evaluation, user } from '../../store/slices';
import global from '../../styles/global';

const USER_VALIDATE_POINT = 10;
const SCORE_DATE_LIMIT = 30; // Day

export default function Modal() {
  const dispatch = useDispatch();
  const evaluationState = useSelector((root: RootState) => root.evaluation);
  const settingsState = useSelector((root: RootState) => root.settings);
  const userState = useSelector((root: RootState) => root.user);

  const handleConfirmFinish = useCallback(() => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    const quizzScore = Math.round(evaluationState.totalScore);

    const updatedScores = Object.keys(userState.scores)
      .filter((d) => {
        const date = new Date();
        const limit = new Date(date.setDate(date.getDate() - SCORE_DATE_LIMIT));

        return new Date(d) > limit;
      })
      .reduce((prev, curr) => ({ ...prev, [curr]: userState.scores[curr] }), {});

    updatedScores[formattedDate] = (userState.dailyScore || 0) + quizzScore;

    const score = {
      total_score: userState.totalScore + quizzScore,
      scores: updatedScores,
      progression: userState.progression,
    };

    core.userService?.updateUserScore(score, 'kanji');
    // Update user state
    dispatch(user.actions.addScoreDaily(Math.round(evaluationState.totalScore)));
    // Reset evaluation state
    dispatch(evaluation.actions.reset({ time: settingsState.evaluationTime, totalCard: settingsState.evaluationCardNumber }));
    router.push('/home');
  }, [userState]);

  const handleValidate = useCallback(
    (id: string, kanjiId: string) => {
      dispatch(evaluation.actions.updateAnswerStatus({ id, status: 'correct', message: 'Validated by the user' }));
      dispatch(evaluation.actions.addPoints(USER_VALIDATE_POINT));
      dispatch(user.actions.updateProgression({ id: kanjiId, inc: KANJI_PROGRESSION_INC_LOW }));
    },
    [dispatch]
  );

  const handleUnvalidate = useCallback(
    (id: string, kanjiId: string) => {
      dispatch(
        evaluation.actions.updateAnswerStatus({
          id,
          status: 'incorrect',
          message: 'Unvalidated by the user',
        })
      );
      dispatch(user.actions.updateProgression({ id: kanjiId, inc: -1 * KANJI_PROGRESSION_INC }));
    },
    [dispatch]
  );

  return (
    <>
      <Text style={global.title}>Quizz result :</Text>
      <Text style={[global.subtitle, { marginLeft: 20 }]}>Total score: {Math.round(evaluationState.totalScore)} pts</Text>
      <ScrollView style={{ margin: 20 }}>
        {evaluationState.answers.map((a, ind) => (
          <View key={`result-${ind}`}>
            <List.Item
              title={`Answer was ${a.kanji}`}
              titleStyle={{ fontWeight: '700', color: colors.primary }}
              description={a.message}
              left={() => <Avatar.Image source={{ uri: a.image }} size={40} />}
              right={(props) =>
                a.status === 'toReview' && (
                  <View {...props} style={{ flexDirection: 'row' }}>
                    <IconButton
                      icon="checkbox-marked-circle-outline"
                      iconColor={colors.success}
                      onPress={() => handleValidate(a.recognitionId!, a.kanjiId)}
                    />
                    <IconButton
                      icon="close-circle-outline"
                      iconColor={colors.primaryDark}
                      onPress={() => handleUnvalidate(a.recognitionId!, a.kanjiId)}
                    />
                  </View>
                )
              }
            />
            {ind < evaluationState.answers.length - 1 && <Divider />}
          </View>
        ))}
      </ScrollView>
      <Button mode="contained" onPress={handleConfirmFinish} style={{ marginHorizontal: 20, marginBottom: 10 }}>
        Finish
      </Button>
    </>
  );
}
