import { load } from '@kanjiup/recognition';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';

import Spacing from '../../../components/spacing';
import { useToaster } from '../../../providers/toaster';
import EvaluationScreen from '.';

const numberKanji = 20;

export default function EvaluationHoc() {
  const navigation = useNavigation();
  const [isModelLoaded, setModelLoaded] = useState(false);
  const toast = useToaster();

  useEffect(() => {
    load()
      .then(() => {
        setModelLoaded(true);
      })
      .catch(() => {
        toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
      });
  }, [toast]);

  if (!isModelLoaded)
    return (
      <View center>
        <ActivityIndicator color={Colors.$textPrimary} size="large" />
        <Spacing y={10} />
        <Text>Loading kanji recognition model...</Text>
      </View>
    );
  return <EvaluationScreen />;
}
