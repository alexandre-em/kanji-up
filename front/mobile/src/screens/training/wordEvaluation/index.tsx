import { predict } from '@kanjiup/recognition';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Button, Colors, ProgressBar, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { RECOGNITION_MODEL_LABELS } from '../../../constants/recognitionLabels';
import { CANVAS_WIDTH } from '../../../constants/styles';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import {
  getExpectedCharacterOptions,
  init,
  selectWordCurrentIndex,
  selectWordEvaluationItems,
  selectWordEvaluationStatus,
  updateItemSlots,
  WordSlotType,
} from '../../../store/slices/wordEvaluation';
import DraggableSlotRow from './components/draggableSlotRow';
import WordSlotCanvas, { WordSlotCanvasHandle } from './components/wordSlotCanvas';
import { findMaskedExampleHint } from './exampleHint';
import { useWordEvaluationStyles } from './hooks/useWordEvaluationStyles';
import WordEvaluationResult from './result';
import { FilledSlot, LocalSlot, resolveSlotOnLeave } from './slotDrawing';

const SLOT_SIZE = 160;
const SLOT_SIZE_COMPACT = 110;

export default function WordEvaluationScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const currentIndex = useAppSelector(selectWordCurrentIndex);
  const items = useAppSelector(selectWordEvaluationItems);
  const status = useAppSelector(selectWordEvaluationStatus);
  const toast = useToaster();
  const { t } = useTranslation();
  const styles = useWordEvaluationStyles();

  // Cards only ever show a completed drawing — a fresh, not-yet-drawn slot exists in state (so it
  // has an id the canvas can target) but stays out of every filled-slots view until it actually
  // has a drawing; the "+" tile itself stands in for it visually, highlighted while it's active
  const [slots, setSlots] = useState<LocalSlot[]>([]);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextSlotId = useRef(0);
  const canvasRef = useRef<WordSlotCanvasHandle>(null);

  const currentItem = items[currentIndex];
  const isSessionOver = currentIndex >= items.length;
  const filledSlots = useMemo(() => slots.filter((slot): slot is FilledSlot => slot.image !== null), [slots]);
  // A single-kanji word gets the full-size slot; a multi-kanji word shrinks each one so more of
  // the word fits on screen at once instead of scrolling through full-size tiles
  const slotSize = filledSlots.length > 1 ? SLOT_SIZE_COMPACT : SLOT_SIZE;
  // No example sentence contains any of this word's spellings verbatim: falls back to its
  // reading below rather than leaving the player with nothing to go on
  const exampleHint = useMemo(() => (currentItem ? findMaskedExampleHint(currentItem.word) : null), [currentItem]);
  const firstKanjiSegmentIndex = useMemo(
    () => exampleHint?.segments.findIndex((segment) => segment.isKanji) ?? -1,
    [exampleHint],
  );

  useEffect(() => {
    setSlots([]);
    setActiveSlotId(null);
    nextSlotId.current = 0;
    canvasRef.current?.clear();
  }, [currentIndex]);

  useEffect(() => {
    if (isSessionOver) navigation.setOptions({ headerShown: false });
  }, [isSessionOver, navigation]);

  // Captures whatever's currently on the shared canvas and folds it into `slots` for whichever
  // slot is active, then clears the canvas so it's blank for the next target. Every handler that's
  // about to point the canvas at a different slot (or none) awaits this first — capture itself is
  // async, since the forced capture colors need a render tick to actually commit before a snapshot
  // reflects them (see WordSlotCanvas). Returns the resolved array directly rather than relying on
  // the `slots` state updating in time: a caller like handleValidate needs it in the same tick.
  const flushActiveSlot = useCallback(async (): Promise<LocalSlot[]> => {
    if (activeSlotId === null || !canvasRef.current) return slots;

    const strokesCount = canvasRef.current.getStrokesCount();
    const image = strokesCount > 0 ? await canvasRef.current.capture() : null;
    canvasRef.current.clear();

    const resolved = resolveSlotOnLeave(slots, activeSlotId, { image, strokesCount });
    setSlots(resolved);
    return resolved;
  }, [activeSlotId, slots]);

  const handleSelectSlot = useCallback(
    async (id: number) => {
      if (id === activeSlotId) return;
      await flushActiveSlot();
      setActiveSlotId(id);
    },
    [activeSlotId, flushActiveSlot],
  );

  const handleAddSlot = useCallback(async () => {
    await flushActiveSlot();
    const id = nextSlotId.current++;
    setSlots((prev) => [...prev, { id, image: null, strokesCount: 0 }]);
    setActiveSlotId(id);
  }, [flushActiveSlot]);

  const handleDeleteSlot = useCallback(
    (id: number) => {
      if (id === activeSlotId) {
        canvasRef.current?.clear();
        setActiveSlotId(null);
      }
      setSlots((prev) => prev.filter((slot) => slot.id !== id));
    },
    [activeSlotId],
  );

  // Reordering only ever touches the filled slots the row actually renders — a fresh, not-yet-drawn
  // slot isn't part of that view (see the `slots` state comment above), so it's preserved as-is
  // rather than dropped by replacing the whole array with just the reordered filled ones
  const handleReorder = useCallback((reordered: FilledSlot[]) => {
    setSlots((prev) => [...reordered, ...prev.filter((slot) => slot.image === null)]);
  }, []);

  const handleValidate = useCallback(async () => {
    setIsSubmitting(true);
    const latestSlots = await flushActiveSlot();
    const currentFilledSlots = latestSlots.filter((slot): slot is FilledSlot => slot.image !== null);
    const expectedCharacterOptions = currentItem ? getExpectedCharacterOptions(currentItem.word) : [];

    try {
      const resolvedSlots: WordSlotType[] = await Promise.all(
        currentFilledSlots.map(async (slot, index) => {
          // The model only classifies into the fixed set it was trained on — calling predict() is
          // pointless when NONE of this slot's accepted characters (every spelling variant, not
          // just the primary one) are in that set, since it could only ever misclassify. No
          // predictions routes this slot's word to 'review' (updateItemSlots), for the user to
          // arbitrate themselves. If at least one accepted variant is recognizable, predict() still
          // runs — computeSlotStatus already checks a prediction against every accepted option.
          const options = expectedCharacterOptions[index] ?? [];
          const noOptionRecognizable =
            options.length > 0 && options.every((character) => !RECOGNITION_MODEL_LABELS.has(character));
          if (noOptionRecognizable) {
            return { image: slot.image, predictions: [], strokesCount: slot.strokesCount };
          }

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
  }, [flushActiveSlot, dispatch, toast, t, currentItem]);

  if (items.length === 0 && (status === 'idle' || status === 'pending')) {
    return <Layout screen="wordEvaluation" loadingMessage={t('loading.title')} />;
  }

  if (status === 'failed') {
    return (
      <Layout screen="wordEvaluation">
        <View center flex>
          <Text text70BO $textDefault center>
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
      <Layout screen="wordEvaluation">
        <View center flex>
          <Text text70BO $textDefault center>
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
    <Layout screen="wordEvaluation">
      <RNView style={styles.screenContent}>
        <RNView>
          <RNView style={styles.progressHeader}>
            <Text text80M $textNeutral>
              {t('wordEvaluation.progress')}
            </Text>
            <RNView style={styles.progressBadge}>
              <Text text90BO $textPrimary>
                {currentIndex + 1} / {items.length}
              </Text>
            </RNView>
          </RNView>
          <ProgressBar
            progress={((currentIndex + 1) / items.length) * 100}
            fullWidth
            style={styles.progressBar}
            progressColor={Colors.$backgroundPrimaryHeavy}
          />
        </RNView>

        <Spacing y={24} />
        <RNView style={styles.hintCard}>
          {exampleHint ? (
            <RNView style={styles.hintSentence}>
              <Text text60M $textDefault>
                {exampleHint.prefix}
              </Text>
              {exampleHint.segments.map((segment, index) =>
                segment.isKanji ? (
                  <RNView key={index} style={styles.hintBlank}>
                    {index === firstKanjiSegmentIndex && exampleHint.reading && (
                      <Text style={styles.hintReading} numberOfLines={1}>
                        {exampleHint.reading}
                      </Text>
                    )}
                    <RNView style={[styles.hintChip, { width: Math.max(40, segment.text.length * 22) }]} />
                  </RNView>
                ) : (
                  <Text key={index} text60M $textDefault>
                    {segment.text}
                  </Text>
                ),
              )}
              <Text text60M $textDefault>
                {exampleHint.suffix}
              </Text>
            </RNView>
          ) : (
            // No example sentence contains this word: fall back to its reading, plus the
            // translation underneath since there's no sentence context to lean on here
            <>
              <Text h1 $textDefault>
                {currentItem?.word.reading?.[0]}
              </Text>
              <Spacing y={6} />
              <Text text80M $textNeutral>
                {currentItem?.word.definition?.[0]?.meaning?.join(', ')}
              </Text>
            </>
          )}
        </RNView>

        <RNView style={styles.spacer} />

        <RNView>
          <Text text80BO $textNeutral>
            {t('wordEvaluation.drawings.title')}
          </Text>
          {filledSlots.length > 1 && (
            <Text text100L $textNeutral>
              {t('wordEvaluation.drawings.reorderHint')}
            </Text>
          )}
          <Spacing y={10} />
          <DraggableSlotRow
            slots={filledSlots}
            slotSize={slotSize}
            activeSlotId={activeSlotId}
            onReorder={handleReorder}
            onSlotPress={handleSelectSlot}
            onAddSlot={handleAddSlot}
            onDeleteSlot={handleDeleteSlot}
            addSlotAccessibilityLabel={t('wordEvaluation.addSlot.accessibilityLabel')}
            slotAccessibilityLabel={t('wordEvaluation.slot.accessibilityLabel')}
            slotAccessibilityHint={t('wordEvaluation.slot.accessibilityHint')}
            deleteAccessibilityLabel={t('wordEvaluation.slot.deleteAccessibilityLabel')}
          />
          <Spacing y={20} />
          {activeSlotId !== null ? (
            <RNView style={styles.canvasWrapper}>
              <WordSlotCanvas ref={canvasRef} size={CANVAS_WIDTH} />
            </RNView>
          ) : (
            <RNView style={styles.canvasEmptyState}>
              <Text text80M $textGeneral center>
                {t('wordEvaluation.canvas.empty')}
              </Text>
            </RNView>
          )}
          <Spacing y={20} />
          <Button label={t('wordEvaluation.validate')} onPress={handleValidate} disabled={isSubmitting} />
        </RNView>
      </RNView>
    </Layout>
  );
}
