import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View as RNView } from 'react-native';
import { Button, Card, Colors, Text, View } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';
import { useSelector } from 'react-redux';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { screenNames } from '../../constants/screens';
import { GENERAL_MARGIN } from '../../constants/styles';
import { trainingModes, TrainingModeType } from '../../constants/training';
import { selectSelectedKanji } from '../../store/slices/selectedKanji';

const { width } = Dimensions.get('window');
const { Dialog } = Incubator;

export default function TrainingModes() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const selectedKanjiState = useSelector(selectSelectedKanji);
  const [isEmptySelectionVisible, setEmptySelectionVisible] = useState(false);

  const handlePress = useCallback(
    (mode: TrainingModeType) => {
      if (mode.comingSoon) return;

      const hasSelectedKanji = Object.keys(selectedKanjiState ?? {}).length > 0;
      if (!hasSelectedKanji) {
        setEmptySelectionVisible(true);
        return;
      }

      navigation.navigate(mode.screen as never);
    },
    [navigation, selectedKanjiState],
  );

  const handleGoToSelection = useCallback(() => {
    setEmptySelectionVisible(false);
    navigation.navigate(screenNames.CATEGORIES as never);
  }, [navigation]);

  return (
    <Layout screen="training" withTabBar>
      <Spacing y={10} />
      {trainingModes.map((mode) => (
        <View key={mode.textKey}>
          <Spacing y={15} />
          <Card
            height={105}
            width={width - GENERAL_MARGIN * 2}
            onPress={() => handlePress(mode)}
            disabled={mode.comingSoon}
            row
            centerV
            style={[styles.card, mode.comingSoon && styles.cardDisabled]}>
            <View style={styles.iconContainer}>{mode.icon}</View>
            <View style={styles.textContainer}>
              <Text text60BL>{t(mode.textKey)}</Text>
              <Text text80M $textNeutral>
                {t(mode.subtitle)}
              </Text>
              {mode.comingSoon && (
                <Text text90M $textPrimary>
                  {t('training.comingSoon')}
                </Text>
              )}
            </View>
          </Card>
        </View>
      ))}
      <Dialog visible={isEmptySelectionVisible} onDismiss={() => setEmptySelectionVisible(false)} bottom useSafeArea width="100%">
        <RNView style={styles.emptySelectionModal}>
          <Text text70BO>{t('home.evaluation.emptySelection.title')}</Text>
          <Spacing y={8} />
          <Text text80M $textGeneral>
            {t('home.evaluation.emptySelection.message')}
          </Text>
          <Spacing y={20} />
          <RNView style={styles.emptySelectionActions}>
            <Button
              label={t('home.evaluation.emptySelection.cancel')}
              outline
              onPress={() => setEmptySelectionVisible(false)}
              style={styles.emptySelectionButton}
            />
            <Button
              label={t('home.evaluation.emptySelection.confirm')}
              onPress={handleGoToSelection}
              style={styles.emptySelectionButton}
            />
          </RNView>
        </RNView>
      </Dialog>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    gap: 15,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.$backgroundNeutralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  emptySelectionModal: {
    padding: 20,
    backgroundColor: Colors.$backgroundDefault,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  emptySelectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptySelectionButton: {
    flex: 1,
  },
});
