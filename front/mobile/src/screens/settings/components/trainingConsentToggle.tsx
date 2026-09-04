import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Colors, Switch, Text } from 'react-native-ui-lib';

import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { selectTrainingConsent, selectUserState, updateTrainingConsent } from '../../../store/slices/user';

export default function TrainingConsentToggle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const { userId } = useAppSelector(selectUserState);
  const trainingConsent = useAppSelector(selectTrainingConsent);

  const handleChange = useCallback(
    (value: boolean) => {
      if (!userId) return;
      dispatch(updateTrainingConsent({ userId, trainingConsent: value }));
      toast?.show({ message: t('settings.trainingConsent.toast'), type: 'success' });
    },
    [dispatch, toast, t, userId],
  );

  return (
    <RNView style={[styles.row, { borderColor: Colors.$outlineNeutral }]}>
      <Text text80M $textDefault style={styles.label}>
        {t('settings.trainingConsent.title')}
      </Text>
      <Switch value={trainingConsent} onValueChange={handleChange} onColor={Colors.$backgroundPrimaryHeavy} />
    </RNView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
    marginRight: 12,
  },
});
