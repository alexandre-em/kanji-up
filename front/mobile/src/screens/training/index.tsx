import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View as RNView } from 'react-native';
import { Badge, Button, Card, Colors, Text, View } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { MIN_LIST_SIZE_FOR_GAME } from '../../constants/lists';
import { screenNames } from '../../constants/screens';
import { GENERAL_MARGIN } from '../../constants/styles';
import { trainingModes, TrainingModeType } from '../../constants/training';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useIsOffline } from '../../providers/network';
import { lists, selectLists } from '../../store/slices/lists';
import ListPickerDialog from '../kanji/difficulty/kanjiList/components/listPickerDialog';

const { width } = Dimensions.get('window');
const { Dialog } = Incubator;

export default function TrainingModes() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isOffline = useIsOffline();
  const allLists = useAppSelector(selectLists);
  const [pendingMode, setPendingMode] = useState<TrainingModeType | null>(null);
  const [isListPickerVisible, setIsListPickerVisible] = useState(false);
  const [emptyListId, setEmptyListId] = useState<string | null>(null);

  const handlePress = useCallback(
    (mode: TrainingModeType) => {
      if (mode.comingSoon || (mode.requiresNetwork && isOffline)) return;

      if (mode.skipListPicker) {
        navigation.navigate(mode.screen as never);
        return;
      }

      setPendingMode(mode);
      setIsListPickerVisible(true);
    },
    [navigation, isOffline],
  );

  const handleListPicked = useCallback(
    (id: string) => {
      setIsListPickerVisible(false);
      dispatch(lists.actions.setActiveList(id));

      if (!allLists[id] || allLists[id].kanjiIds.length < MIN_LIST_SIZE_FOR_GAME) {
        setEmptyListId(id);
        return;
      }

      if (pendingMode) navigation.navigate(pendingMode.screen as never);
    },
    [allLists, dispatch, pendingMode, navigation],
  );

  const handleGoToSelection = useCallback(() => {
    setEmptyListId(null);
    navigation.navigate(screenNames.CATEGORIES as never);
  }, [navigation]);

  return (
    <Layout screen="training" withTabBar>
      <Spacing y={10} />
      <Button
        label={t('training.viewStats')}
        outline
        size={Button.sizes.small}
        onPress={() => navigation.navigate(screenNames.PROFILE as never)}
      />
      {trainingModes.map((mode) => {
        const isModeOffline = mode.requiresNetwork && isOffline;
        const isDisabled = mode.comingSoon || isModeOffline;

        return (
          <View key={mode.textKey}>
            <Spacing y={15} />
            <Card
              height={105}
              width={width - GENERAL_MARGIN * 2}
              onPress={() => handlePress(mode)}
              disabled={isDisabled}
              style={[styles.card, isDisabled && styles.cardDisabled]}>
              {isModeOffline && (
                <Badge
                  label={t('offline.badge')}
                  size={20}
                  backgroundColor={Colors.$backgroundGeneralHeavy}
                  labelStyle={styles.badgeLabel}
                  style={styles.badge}
                />
              )}
              <Card.Section
                flex
                content={[{ text: t(mode.textKey), text60BL: true, white: true }]}
                contentStyle={styles.transparent}
                style={styles.transparent}
                center
              />
              <Card.Section
                flex
                content={[{ text: t(mode.subtitle), text80M: true, white: true }]}
                contentStyle={styles.transparent}
                style={styles.transparent}
                center
              />
              {mode.comingSoon && (
                <Card.Section
                  flex
                  content={[{ text: t('training.comingSoon'), text90M: true, white: true }]}
                  contentStyle={styles.transparent}
                  style={styles.transparent}
                  center
                />
              )}
              {mode.image}
            </Card>
          </View>
        );
      })}
      <ListPickerDialog
        visible={isListPickerVisible}
        lists={Object.values(allLists)}
        onSelect={handleListPicked}
        onClose={() => setIsListPickerVisible(false)}
      />
      <Dialog visible={!!emptyListId} onDismiss={() => setEmptyListId(null)} bottom useSafeArea width="100%">
        <RNView style={[styles.emptySelectionModal, { backgroundColor: Colors.$backgroundDefault }]}>
          <Text text70BO $textDefault>
            {t('home.evaluation.emptySelection.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral>
            {t('home.evaluation.emptySelection.message', { min: MIN_LIST_SIZE_FOR_GAME })}
          </Text>
          <Spacing y={20} />
          <RNView style={styles.emptySelectionActions}>
            <Button
              label={t('home.evaluation.emptySelection.cancel')}
              outline
              onPress={() => setEmptyListId(null)}
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
  },
  cardDisabled: {
    opacity: 0.5,
  },
  badge: { position: 'absolute', right: 10, top: 10, zIndex: 1 },
  badgeLabel: { color: '#fff' },
  transparent: { backgroundColor: '#00000000' },
  emptySelectionModal: {
    padding: 20,
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
