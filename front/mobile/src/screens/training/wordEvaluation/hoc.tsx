import { load } from '@kanjiup/recognition';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { init } from '../../../store/slices/wordEvaluation';
import WordEvaluationScreen from '.';

const NUMBER_OF_WORDS = 10;

export default function WordEvaluationHoc() {
  const dispatch = useAppDispatch();
  const [isModelLoaded, setModelLoaded] = useState(false);
  const toast = useToaster();

  useEffect(() => {
    load()
      .then(() => setModelLoaded(true))
      .catch(() => {
        toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
      });
  }, [toast]);

  useEffect(() => {
    void dispatch(init({ number: NUMBER_OF_WORDS }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isModelLoaded)
    return (
      <Layout screen="wordEvaluation" hideBanner>
        <View center>
          <ActivityIndicator color={Colors.$textPrimary} size="large" />
          <Spacing y={10} />
          <Text $textDefault>Loading kanji recognition model...</Text>
        </View>
      </Layout>
    );

  return <WordEvaluationScreen />;
}
