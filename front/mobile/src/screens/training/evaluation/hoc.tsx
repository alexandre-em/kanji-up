import { load } from '@kanjiup/recognition';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { init, selectEvaluationItems } from '../../../store/slices/evaluation';
import { selectSelectedKanji } from '../../../store/slices/selectedKanji';
import EvaluationScreen from '.';

const numberKanji = 20;

export default function EvaluationHoc() {
  const kanjis = useAppSelector(selectSelectedKanji);
  const evaluationItems = useAppSelector(selectEvaluationItems);
  const dispatch = useAppDispatch();
  const [isModelLoaded, setModelLoaded] = useState(false);
  const toast = useToaster();

  const kanjiQueue = useCallback(() => {
    const kanjiValues = Object.values(kanjis);

    if (kanjiValues.length > 0) {
      return Array.from(Array(numberKanji).keys()).map(() => kanjiValues[Math.floor(Math.random() * kanjiValues.length)]);
    }
    return [];
  }, [kanjis]);

  useEffect(() => {
    load()
      .then(() => {
        setModelLoaded(true);
      })
      .catch(() => {
        toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
      });
  }, [toast]);

  useEffect(() => {
    console.log('init evaluation');
    void dispatch(init({ kanjis: kanjiQueue() }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log({ evaluationItems });

  if (!isModelLoaded)
    return (
      <Layout screen="evaluation" hideBanner>
        <View center>
          <ActivityIndicator color={Colors.$textPrimary} size="large" />
          <Spacing y={10} />
          <Text>Loading kanji recognition model...</Text>
        </View>
      </Layout>
    );

  //TODO: add finish screen component

  return <EvaluationScreen />;
}
