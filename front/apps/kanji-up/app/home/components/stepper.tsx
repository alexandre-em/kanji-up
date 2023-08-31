import React, { useMemo } from 'react';

import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Button, Surface } from 'react-native-paper';
import StepIndicator from 'react-native-step-indicator';

import { colors } from '../../../constants/Colors';
import { labels } from '../constants';
import globalStyles from '../../../styles/global';
import styles, { stepperStyles } from '../style';
import { RootState } from '../../../store';

import Certification from '../../../svg/Certification';
import Reminders from '../../../svg/Reminders';
import Trip from '../../../svg/Trip';

type StepperProps = {
  onRefresh: () => void;
};

export default function Stepper({ onRefresh }: StepperProps) {
  const userState = useSelector((state: RootState) => state.user);

  const step = useMemo(() => {
    const { dailyScore } = userState;
    if (dailyScore < parseInt(labels[0], 10)) {
      return 0;
    }
    if (dailyScore < parseInt(labels[1], 10)) {
      return 1;
    }
    if (dailyScore < parseInt(labels[2], 10)) {
      return 2;
    }
    return 0;
  }, [userState]);

  const stepperIllustration = useMemo(() => {
    if (step === 0) {
      return <Trip width={220} height={180} />;
    }
    if (step === 1) {
      return <Reminders width={220} height={180} />;
    }
    if (step === 2) {
      return <Certification width={220} height={180} />;
    }

    return null;
  }, [step]);

  const stepperMessage = useMemo(() => {
    if (step === 0) {
      return "Let's begin !";
    }
    if (step === 1) {
      return 'Almost there !';
    }
    if (step === 2) {
      return 'Good job !';
    }

    return '';
  }, [step]);

  return (
    <View>
      <View style={styles.stepper}>
        <Text style={globalStyles.title}>Today&apos;s objectives</Text>
        <StepIndicator stepCount={3} customStyles={stepperStyles} currentPosition={step} labels={labels} />
      </View>

      <Surface style={styles.surface}>
        <View style={{ marginHorizontal: 20 }}>{stepperIllustration}</View>
        <View style={{ margin: 10 }}>
          <Text style={{ color: colors.secondary, fontSize: 30, fontWeight: '800', marginHorizontal: 20 }}>{stepperMessage}</Text>
          <Text style={[globalStyles.title, { fontSize: 22, marginTop: 0 }]}>{userState.dailyScore || 0} pts</Text>
          <Button icon="reload" onPress={onRefresh} mode="contained" style={{ borderRadius: 25 }}>
            Synchronize
          </Button>
        </View>
      </Surface>
    </View>
  );
}
