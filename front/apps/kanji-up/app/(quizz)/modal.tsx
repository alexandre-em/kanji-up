import React, { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Avatar, Button, Divider, IconButton, List } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'store';
import { colors } from 'constants/Colors';
import { evaluation, user } from 'store/slices';
import { router } from 'expo-router';
import global from 'styles/global';

const USER_VALIDATE_POINT = 10;

export default function Modal() {
  const dispatch = useDispatch();
  const evaluationState = useSelector((root: RootState) => root.evaluation);
  const settingsState = useSelector((root: RootState) => root.settings);

  const handleConfirmFinish = useCallback(() => {
    if (user) {
      dispatch(user.actions.addScoreDaily(Math.round(evaluationState.totalScore)));
    }

    dispatch(evaluation.actions.reset({ time: settingsState.evaluationTime, totalCard: settingsState.evaluationCardNumber }));
    router.push('/home');
  }, []);

  const handleValidate = useCallback(
    (id: string) => {
      dispatch(
        evaluation.actions.updateAnswerStatus({ id, status: 'correct', message: 'This answer has been validated by the user' })
      );
      dispatch(evaluation.actions.addPoints(USER_VALIDATE_POINT));
    },
    [dispatch]
  );

  const handleUnvalidate = useCallback(
    (id: string) => {
      dispatch(
        evaluation.actions.updateAnswerStatus({
          id,
          status: 'incorrect',
          message: 'This answer has been unvalidated by the user',
        })
      );
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
                      iconColor="#bdf56e"
                      onPress={() => handleValidate(a.recognitionId!)}
                    />
                    <IconButton
                      icon="close-circle-outline"
                      iconColor={colors.primaryDark}
                      onPress={() => handleUnvalidate(a.recognitionId!)}
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
