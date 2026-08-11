import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Button, Colors, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../../../components/spacing';
import { screenNames } from '../../../../constants/screens';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';

const { Dialog } = Incubator;

type UnlockModalProps = {
  visible: boolean;
  label: string;
  cost: number;
  credits: number;
  isUnlocking: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function UnlockModal({ visible, label, cost, credits, isUnlocking, onConfirm, onClose }: UnlockModalProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const canAfford = credits >= cost;
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      modal: {
        backgroundColor: Colors.$backgroundDefault,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
      },
      actions: {
        flexDirection: 'row',
        gap: 10,
      },
      button: {
        flex: 1,
      },
    }),
  );

  const handleGoEarnCredits = useCallback(() => {
    onClose();
    navigation.navigate(screenNames.HOME);
  }, [onClose, navigation]);

  return (
    <Dialog
      visible={visible}
      onDismiss={onClose}
      bottom
      useSafeArea
      width="100%"
      // RNUI's Dialog memoizes its own background without a theme dependency, so it can freeze
      // on whichever scheme was active at first mount — this forces it fresh on every render
      containerStyle={{ backgroundColor: Colors.$backgroundDefault }}>
      <RNView style={styles.modal}>
        <Text text70BO $textDefault>
          {t('kanjiList.unlock.title', { label })}
        </Text>
        <Spacing y={8} />
        <Text text80M $textGeneral>
          {t('kanjiList.unlock.cost', { cost })}
        </Text>
        <Text text90M $textNeutral>
          {t('kanjiList.unlock.balance', { credits })}
        </Text>
        <Spacing y={20} />
        {canAfford ? (
          <RNView style={styles.actions}>
            <Button label={t('kanjiList.unlock.cancel')} outline onPress={onClose} style={styles.button} disabled={isUnlocking} />
            <Button label={t('kanjiList.unlock.confirm')} onPress={onConfirm} style={styles.button} disabled={isUnlocking} />
          </RNView>
        ) : (
          <>
            <Text text90M $textPrimary>
              {t('kanjiList.unlock.insufficient', { missing: cost - credits })}
            </Text>
            <Spacing y={12} />
            <RNView style={styles.actions}>
              <Button label={t('kanjiList.unlock.cancel')} outline onPress={onClose} style={styles.button} />
              <Button label={t('kanjiList.unlock.earnCredits')} onPress={handleGoEarnCredits} style={styles.button} />
            </RNView>
          </>
        )}
      </RNView>
    </Dialog>
  );
}
