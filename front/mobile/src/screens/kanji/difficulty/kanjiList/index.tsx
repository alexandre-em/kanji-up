import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Assets, Badge, Button, Card, Colors, Text, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import { TAB_BAR_TOTAL_HEIGHT } from '../../../../components/bottomNavBar';
import Layout from '../../../../components/layout';
import Spacing from '../../../../components/spacing';
import Lock from '../../../../components/svg/lock';
import { screenNames } from '../../../../constants/screens';
import { BULK_UNLOCK_COST, getTierKey, PER_KANJI_UNLOCK_COST } from '../../../../constants/unlockCosts';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useStore';
import { useToaster } from '../../../../providers/toaster.tsx';
import { getAll, selectGetAllStatus, selectLastGet } from '../../../../store/slices/kanji';
import { selectGetAllResult } from '../../../../store/slices/kanji';
import {
  save,
  selectedKanji,
  selectKanjiToAdd,
  selectKanjiToDelete,
  selectSaveStatus,
  selectSelectedKanji,
} from '../../../../store/slices/selectedKanji';
import { selectUserState, unlockContent } from '../../../../store/slices/user';
import { isKanjiLocked } from '../../../../utils/kanjiLock';
import UnlockModal from './unlockModal';

type KanjiListProps = RouteParamsProps<{
  difficulty: string;
  category: 'jlpt' | 'grade';
}>;

type KanjiCardElementProps = {
  kanji: Partial<KanjiType>;
  onPress: (kanji: Partial<KanjiType>) => void;
  isLocked: boolean;
};

const CARD_SIZE = 50;

const KanjiCardElement = ({ kanji, onPress, isLocked }: KanjiCardElementProps) => {
  const entities = useSelector(selectSelectedKanji);
  const toAdd = useSelector(selectKanjiToAdd);
  const toRemove = useSelector(selectKanjiToDelete);

  const color = useMemo(() => {
    if (toRemove[kanji.kanji_id!]) {
      return Colors.$backgroundPrimaryHeavy;
    }
    if (toAdd[kanji.kanji_id!]) {
      console.log('Added !', kanji.kanji_id);
      return Colors.$backgroundSuccessHeavy;
    }
    if (entities[kanji.kanji_id!]) {
      console.log('Removed !', kanji.kanji_id);
      return Colors.$backgroundNeutralHeavy;
    }
    return Colors.$backgroundNeutralLight;
  }, [kanji.kanji_id, entities, toAdd, toRemove]);

  const label = useMemo(() => {
    if (toRemove[kanji.kanji_id!]) {
      return Assets.icons.remove;
    }
    if (toAdd[kanji.kanji_id!]) {
      return Assets.icons.add;
    }
    if (entities[kanji.kanji_id!]) {
      return Assets.icons.check;
    }
    return undefined;
  }, [kanji.kanji_id, entities, toAdd, toRemove]);

  const isBadgeVisible = useMemo(() => {
    return toRemove[kanji.kanji_id!] || toAdd[kanji.kanji_id!] || entities[kanji.kanji_id!];
  }, [kanji.kanji_id, entities, toAdd, toRemove]);

  return (
    <Card style={[styles.cardContainer, isLocked && styles.cardLocked]} width={CARD_SIZE} height={CARD_SIZE} onPress={onPress}>
      {isBadgeVisible && !isLocked && (
        <Badge
          icon={label}
          iconStyle={{ tintColor: '#fff', width: 15, height: 15 }}
          style={{ position: 'absolute', right: 0, zIndex: 100 }}
          size={20}
          backgroundColor={color}
        />
      )}
      {isLocked ? (
        <View style={[styles.lockedContent, { backgroundColor: Colors.$backgroundNeutralMedium }]}>
          <Lock size={18} color={Colors.$iconNeutral} />
        </View>
      ) : (
        <Card.Section
          content={[{ text: kanji.kanji!.character, text40BL: true, color: Colors.$textDefault }]}
          contentStyle={[styles.cardContent, { backgroundColor: Colors.$backgroundNeutralLight }]}
        />
      )}
    </Card>
  );
};

export default function KanjiList(props: KanjiListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [isSelectModeOn, setIsSelectModeOn] = useState(false);
  const [isBulkUnlockVisible, setIsBulkUnlockVisible] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const navigation = useNavigation();
  const last = useAppSelector(selectLastGet);
  const kanjis = useAppSelector(selectGetAllResult);
  const kanjisStatus = useAppSelector(selectGetAllStatus);
  const entities = useSelector(selectSelectedKanji);
  const toAdd = useSelector(selectKanjiToAdd);
  const toRemove = useSelector(selectKanjiToDelete);
  const saveStatus = useSelector(selectSaveStatus);
  const { difficulty, category } = props.route.params;
  const toaster = useToaster();
  const userState = useAppSelector(selectUserState);

  const tierKey = getTierKey(category, difficulty);
  const perKanjiCost = PER_KANJI_UNLOCK_COST[tierKey];
  const bulkCost = BULK_UNLOCK_COST[tierKey];
  const isPremium = userState.subscriptionPlan === 'premium';
  const isTierUnlocked = userState.unlockedDifficulties.includes(tierKey);
  // Only paid tiers (present in the cost table) have anything to unlock — free tiers (JLPT
  // N5/N4, grade 1-6) never gate a single kanji, perKanjiCost stays undefined for them
  const isTierPaid = perKanjiCost !== undefined;

  const kanjiList = useMemo(() => {
    const isOnline = true;
    if (isOnline) return kanjis; // TODO: check connection

    return Object.values(entities).filter((entity) => Number(entity.kanji?.jlpt) === Number(difficulty));
  }, [kanjis, difficulty, entities]);

  const handleEndReached = useCallback(() => {
    if (difficulty === last?.difficulty && category === last?.type && last.page > 0 && last.page <= last.totalPage) {
      dispatch(getAll({ type: category, difficulty, page: last.page + 1 }));
    }
  }, [dispatch, last?.difficulty, last?.type, last?.page, last?.totalPage, category, difficulty]);

  const handleRedirect = useCallback(
    (kanji: Partial<KanjiType>) => {
      navigation.navigate(screenNames.KANJI, { character: kanji.kanji_id });
    },
    [navigation],
  );

  const handleSelect = useCallback(
    (kanji: Partial<KanjiType>) => {
      if (toAdd[kanji.kanji_id!] || (entities[kanji.kanji_id!] && !toRemove[kanji.kanji_id!])) {
        dispatch(selectedKanji.actions.unSelectKanji(kanji));
      } else {
        dispatch(selectedKanji.actions.selectKanji(kanji));
      }
    },
    [dispatch, toAdd, toRemove, entities],
  );

  // Locked kanji navigate through too now — the detail screen is the single place that gates
  // access (it can tell whether a kanji is genuinely locked across all its tiers, not just this
  // one), showing an unlock prompt there instead of blocking the tap here
  const handlePress = useCallback(
    (kanji: Partial<KanjiType>) => {
      if (isSelectModeOn) handleSelect(kanji);
      else handleRedirect(kanji);
    },
    [isSelectModeOn, handleRedirect, handleSelect],
  );

  const handleConfirmUnlock = useCallback(async () => {
    setIsUnlocking(true);
    const action = await dispatch(unlockContent({ userId: userState.userId, scope: 'tier', tier: tierKey }));
    setIsUnlocking(false);

    if (unlockContent.fulfilled.match(action)) {
      toaster?.show({ message: t('kanjiList.unlock.toast.success'), type: 'success' });
      setIsBulkUnlockVisible(false);
    } else {
      toaster?.show({ message: t('kanjiList.unlock.toast.error'), type: 'failure' });
    }
  }, [dispatch, userState.userId, tierKey, toaster, t]);

  const handleSave = useCallback(() => {
    dispatch(save());
    setIsSelectModeOn(false);
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    dispatch(selectedKanji.actions.cancel());
    setIsSelectModeOn(false);
  }, [dispatch]);

  useEffect(() => {
    if (last?.difficulty !== difficulty || last?.type !== category) {
      dispatch(getAll({ type: category, difficulty, page: 1 }));
    }
  }, [category, difficulty, dispatch, last?.page, last?.difficulty, last?.type]);

  useEffect(() => {
    if (toaster) {
      if (saveStatus === 'succeeded') {
        toaster.show({ message: t('kanji.select.toast.success'), type: 'success' });
        dispatch(selectedKanji.actions.resetSaveStatus());
      }
      if (saveStatus === 'failed') {
      }
    }
  }, [saveStatus]);

  return (
    // FlashList scrolls itself and owns its own bottom clearance (contentContainerStyle below):
    // withTabBar on Layout would reserve clearance on the outer (inert) ScrollView too, creating
    // a double gap and letting that outer scroll fire the scroll-hide-bar behavior wrongly
    <Layout screen="kanjiList">
      <View style={styles.buttonGroup}>
        {!isSelectModeOn ? (
          <Button label="Select" onPress={() => setIsSelectModeOn(!isSelectModeOn)} size="xSmall" />
        ) : (
          <>
            <Button label="Save selection" onPress={handleSave} size="xSmall" />
            <Spacing x={10} />
            <Button label="Cancel" onPress={handleCancel} size="xSmall" outline />
          </>
        )}
        {isTierPaid && !isPremium && !isTierUnlocked && (
          <Button
            label={t('kanjiList.unlock.bulkButton', { cost: bulkCost })}
            onPress={() => setIsBulkUnlockVisible(true)}
            size="xSmall"
            outline
            style={styles.unlockAllButton}
          />
        )}
      </View>
      <Spacing y={10} />
      <FlashList
        data={kanjiList}
        keyExtractor={(item) => item.kanji_id!}
        renderItem={({ item }) => (
          <KanjiCardElement kanji={item} onPress={() => handlePress(item)} isLocked={isKanjiLocked(item, userState)} />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.15}
        // FlashList scrolls itself, so Layout's own bottom clearance (built for its outer
        // ScrollView) never reaches it: the floating tab bar would sit on top of the last row
        contentContainerStyle={{ paddingBottom: TAB_BAR_TOTAL_HEIGHT + insets.bottom }}
        ListFooterComponent={
          kanjisStatus === 'pending' ? (
            <View style={styles.loader}>
              <ActivityIndicator style={{ marginVertical: 16 }} color={Colors.$backgroundPrimaryHeavy} size="large" />
              <Spacing x={10} />
              <Text $textDefault>{t('loading.title')}</Text>
            </View>
          ) : null
        }
        numColumns={5}
      />
      <UnlockModal
        visible={isBulkUnlockVisible}
        label={t('kanjiList.unlock.bulk.label')}
        cost={bulkCost ?? 0}
        credits={userState.credits}
        isUnlocking={isUnlocking}
        onConfirm={handleConfirmUnlock}
        onClose={() => setIsBulkUnlockVisible(false)}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: 5,
  },
  cardContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLocked: {
    opacity: 0.5,
  },
  loader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  unlockAllButton: {
    marginLeft: 10,
  },
});
