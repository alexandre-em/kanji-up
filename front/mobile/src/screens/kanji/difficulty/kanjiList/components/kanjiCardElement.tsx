import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Assets, Badge, Card, Colors, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import Lock from '../../../../../components/svg/lock';
import { getAccuracyPercent, ProgressionEntry } from '../../../../../constants/progression';
import {
  selectActiveList,
  selectKanjiToAddToActiveList,
  selectKanjiToRemoveFromActiveList,
} from '../../../../../store/slices/lists';

type KanjiCardElementProps = {
  kanji: Partial<KanjiType>;
  onPress: (kanji: Partial<KanjiType>) => void;
  isLocked: boolean;
  /** undefined for a kanji never practiced yet — no bar shown, distinct from a real 0% */
  progressionEntry: ProgressionEntry | number | undefined;
};

const CARD_SIZE = 50;

export default function KanjiCardElement({ kanji, onPress, isLocked, progressionEntry }: KanjiCardElementProps) {
  const activeList = useSelector(selectActiveList);
  const toAdd = useSelector(selectKanjiToAddToActiveList);
  const toRemove = useSelector(selectKanjiToRemoveFromActiveList);
  const isInActiveList = !!activeList?.kanjiIds.includes(kanji.kanji_id!);

  const progressPercent = getAccuracyPercent(progressionEntry);

  const color = useMemo(() => {
    if (toRemove[kanji.kanji_id!]) {
      return Colors.$backgroundPrimaryHeavy;
    }
    if (toAdd[kanji.kanji_id!]) {
      return Colors.$backgroundSuccessHeavy;
    }
    if (isInActiveList) {
      return Colors.$backgroundNeutralHeavy;
    }
    return Colors.$backgroundNeutralLight;
  }, [kanji.kanji_id, isInActiveList, toAdd, toRemove]);

  const label = useMemo(() => {
    if (toRemove[kanji.kanji_id!]) {
      return Assets.icons.remove;
    }
    if (toAdd[kanji.kanji_id!]) {
      return Assets.icons.add;
    }
    if (isInActiveList) {
      return Assets.icons.check;
    }
    return undefined;
  }, [kanji.kanji_id, isInActiveList, toAdd, toRemove]);

  const isBadgeVisible = useMemo(() => {
    return toRemove[kanji.kanji_id!] || toAdd[kanji.kanji_id!] || isInActiveList;
  }, [kanji.kanji_id, isInActiveList, toAdd, toRemove]);

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
      {/* Locked kanji stay visible — browsable, just not free — with a small lock badge instead
          of hiding the character behind an opaque block */}
      <Card.Section
        content={[{ text: kanji.kanji!.character, text40BL: true, color: Colors.$textDefault }]}
        contentStyle={[styles.cardContent, { backgroundColor: Colors.$backgroundNeutralLight }]}
      />
      {isLocked && (
        <View style={[styles.lockBadge, { backgroundColor: Colors.$backgroundNeutralHeavy }]}>
          <Lock size={11} color="#fff" />
        </View>
      )}
      {progressPercent !== null && (
        <View style={[styles.progressTrack, { backgroundColor: Colors.$backgroundNeutralHeavy }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: progressPercent >= 100 ? Colors.$backgroundSuccessHeavy : Colors.$backgroundPrimaryHeavy,
              },
            ]}
          />
        </View>
      )}
    </Card>
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
  cardLocked: {
    opacity: 0.5,
  },
  lockBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
