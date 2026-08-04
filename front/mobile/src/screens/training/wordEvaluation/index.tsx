import { predict } from '@kanjiup/recognition';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Button, Colors, Icon, ProgressBar, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import {
  init,
  selectWordCurrentIndex,
  selectWordEvaluationItems,
  selectWordEvaluationStatus,
  updateItemSlots,
  WordSlotType,
} from '../../../store/slices/wordEvaluation';
import DrawSlotModal from './drawSlotModal';
import { findMaskedExampleHint } from './exampleHint';
import WordEvaluationResult from './result';

const SLOT_SIZE = 160;

type LocalSlot = {
  id: number;
  image: string | null;
  strokesCount: number;
};

export default function WordEvaluationScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const currentIndex = useAppSelector(selectWordCurrentIndex);
  const items = useAppSelector(selectWordEvaluationItems);
  const status = useAppSelector(selectWordEvaluationStatus);
  const toast = useToaster();
  const { t } = useTranslation();

  const [slots, setSlots] = useState<LocalSlot[]>([{ id: 0, image: null, strokesCount: 0 }]);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextSlotId = useRef(1);

  const currentItem = items[currentIndex];
  const isSessionOver = currentIndex >= items.length;
  const canAddSlot = slots[slots.length - 1]?.image != null;
  // No example sentence contains any of this word's spellings verbatim: falls back to the plain
  // meaning hint below rather than leaving the player with nothing to go on
  const exampleHint = useMemo(() => (currentItem ? findMaskedExampleHint(currentItem.word) : null), [currentItem]);

  useEffect(() => {
    setSlots([{ id: 0, image: null, strokesCount: 0 }]);
    nextSlotId.current = 1;
  }, [currentIndex]);

  useEffect(() => {
    if (isSessionOver) navigation.setOptions({ headerShown: false });
  }, [isSessionOver, navigation]);

  const handleAddSlot = useCallback(() => {
    setSlots((prev) => [...prev, { id: nextSlotId.current++, image: null, strokesCount: 0 }]);
  }, []);

  const handleRemoveSlot = useCallback((id: number) => {
    setSlots((prev) => (prev.length > 1 ? prev.filter((slot) => slot.id !== id) : prev));
  }, []);

  const handleModalDone = useCallback(
    (image: string | null, strokesCount: number) => {
      setSlots((prev) => prev.map((slot) => (slot.id === activeSlotId ? { ...slot, image, strokesCount } : slot)));
      setActiveSlotId(null);
    },
    [activeSlotId],
  );

  const handleValidate = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const resolvedSlots: WordSlotType[] = await Promise.all(
        slots.map(async (slot) => {
          if (!slot.image) return { image: null, predictions: [], strokesCount: 0 };

          const predictions: PredictionType[] = await predict(slot.image);
          return { image: slot.image, predictions, strokesCount: slot.strokesCount };
        }),
      );

      dispatch(updateItemSlots({ slots: resolvedSlots }));
    } catch {
      toast?.show({ message: t('wordEvaluation.error'), type: 'failure' });
    } finally {
      setIsSubmitting(false);
    }
  }, [slots, dispatch, toast, t]);

  if (items.length === 0 && (status === 'idle' || status === 'pending')) {
    return (
      <Layout screen="wordEvaluation" hideBanner>
        <View center flex>
          <ActivityIndicator color={Colors.$textPrimary} size="large" />
        </View>
      </Layout>
    );
  }

  if (status === 'failed') {
    return (
      <Layout screen="wordEvaluation" hideBanner>
        <View center flex>
          <Text text70BO center>
            {t('wordEvaluation.error.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('wordEvaluation.error.message')}
          </Text>
          <Spacing y={20} />
          <Button label={t('wordEvaluation.error.retry')} onPress={() => dispatch(init())} />
        </View>
      </Layout>
    );
  }

  if (status === 'succeeded' && items.length === 0) {
    return (
      <Layout screen="wordEvaluation" hideBanner>
        <View center flex>
          <Text text70BO center>
            {t('wordEvaluation.empty.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('wordEvaluation.empty.message')}
          </Text>
        </View>
      </Layout>
    );
  }

  if (isSessionOver) return <WordEvaluationResult />;

  return (
    <Layout screen="wordEvaluation" hideBanner>
      <RNView style={styles.progressHeader}>
        <Text text70BL>{t('wordEvaluation.progress')}</Text>
        <Text text80BL $textPrimary>
          {currentIndex + 1} / {items.length}
        </Text>
      </RNView>
      <ProgressBar progress={((currentIndex + 1) / items.length) * 100} fullWidth style={styles.progressBar} />
      <Spacing y={20} />
      {exampleHint ? (
        <RNView style={styles.hintSentence}>
          <Text text60M>{exampleHint.prefix}</Text>
          <RNView style={styles.hintBlank}>
            {exampleHint.reading && (
              <Text style={styles.hintReading} numberOfLines={1}>
                {exampleHint.reading}
              </Text>
            )}
            <RNView style={[styles.hintChip, { width: Math.max(40, exampleHint.spelling.length * 22) }]} />
          </RNView>
          <Text text60M>{exampleHint.suffix}</Text>
        </RNView>
      ) : (
        <Text h1>{currentItem?.word.definition?.[0]?.meaning?.join(', ')}</Text>
      )}
      <Spacing y={20} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.slotsScroll}
        contentContainerStyle={styles.slots}>
        {slots.map((slot) => (
          <RNView key={slot.id} style={styles.slotWrapper}>
            <TouchableOpacity
              style={styles.slot}
              onPress={() => setActiveSlotId(slot.id)}
              accessibilityRole="button"
              accessibilityLabel={t('wordEvaluation.slot.accessibilityLabel')}>
              {slot.image ? (
                <Image source={{ uri: `data:image/png;base64,${slot.image}` }} style={styles.slotImage} />
              ) : (
                <Icon source={Assets.icons.draw} size={36} tintColor={Colors.$iconNeutral} />
              )}
            </TouchableOpacity>
            {slots.length > 1 && (
              <TouchableOpacity style={styles.removeSlot} onPress={() => handleRemoveSlot(slot.id)} accessibilityRole="button">
                <Icon source={Assets.icons.cross} size={14} tintColor="#fff" />
              </TouchableOpacity>
            )}
          </RNView>
        ))}
        <TouchableOpacity
          style={[styles.addSlot, !canAddSlot && styles.addSlotDisabled]}
          onPress={handleAddSlot}
          disabled={!canAddSlot}
          accessibilityRole="button">
          <Icon source={Assets.icons.add} size={28} tintColor={canAddSlot ? Colors.$iconPrimary : Colors.$iconNeutral} />
        </TouchableOpacity>
      </ScrollView>
      <Spacing y={20} />
      <Button label={t('wordEvaluation.validate')} onPress={handleValidate} disabled={isSubmitting} />
      <DrawSlotModal visible={activeSlotId !== null} onClose={() => setActiveSlotId(null)} onDone={handleModalDone} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  hintSentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    rowGap: 8,
  },
  hintBlank: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  hintReading: {
    fontSize: 11,
    color: Colors.$textNeutral,
    marginBottom: 2,
  },
  hintChip: {
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.$outlineNeutral,
    backgroundColor: Colors.$backgroundNeutralLight,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
  },
  slotsScroll: {
    height: SLOT_SIZE + 16,
    flexGrow: 0,
  },
  slots: {
    gap: 12,
    alignItems: 'center',
  },
  slotWrapper: {
    position: 'relative',
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.$outlineNeutral,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotImage: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 8,
  },
  removeSlot: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.$backgroundPrimaryHeavy,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  addSlot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.$outlineNeutral,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSlotDisabled: {
    opacity: 0.4,
  },
});
