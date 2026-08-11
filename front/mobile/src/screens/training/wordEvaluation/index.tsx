import { predict } from '@kanjiup/recognition';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Button, Colors, Icon, ProgressBar, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { RECOGNITION_MODEL_LABELS } from '../../../constants/recognitionLabels';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { useToaster } from '../../../providers/toaster';
import {
  getKanjiCharacters,
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
const SLOT_SIZE_COMPACT = 110;

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
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      screenContent: {
        flex: 1,
      },
      spacer: {
        flex: 1,
      },
      hintCard: {
        backgroundColor: Colors.$backgroundNeutralLight,
        borderRadius: 16,
        padding: 20,
      },
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
        backgroundColor: Colors.$backgroundDefault,
      },
      progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      progressBadge: {
        backgroundColor: Colors.$backgroundPrimaryLight,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
      },
      progressBar: {
        height: 8,
        borderRadius: 4,
      },
      slotsScroll: {
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
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.$outlineNeutral,
        backgroundColor: Colors.$backgroundNeutralLight,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      },
      slotImage: {
        borderRadius: 14,
      },
      slotBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        paddingHorizontal: 6,
        backgroundColor: Colors.$backgroundPrimaryHeavy,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      },
      addSlot: {
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.$outlinePrimary,
        borderStyle: 'dashed',
        backgroundColor: Colors.$backgroundPrimaryLight,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  );

  // Cards only ever show a completed drawing — an empty slot exists in state only while its
  // modal is open (see handleAddSlot/handleModalClose), never rendered as a placeholder card
  const [slots, setSlots] = useState<LocalSlot[]>([]);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextSlotId = useRef(0);

  const currentItem = items[currentIndex];
  const isSessionOver = currentIndex >= items.length;
  const activeSlot = useMemo(() => slots.find((slot) => slot.id === activeSlotId), [slots, activeSlotId]);
  // Only a fresh, never-drawn slot can chain into another one — editing an existing drawing has
  // nothing to "add" after it
  const canAddAnother = activeSlot?.image === null;
  const filledSlots = useMemo(() => slots.filter((slot): slot is LocalSlot & { image: string } => slot.image !== null), [slots]);
  // A single-kanji word gets the full-size slot; a multi-kanji word shrinks each one so more of
  // the word fits on screen at once instead of scrolling through full-size tiles
  const slotSize = filledSlots.length > 1 ? SLOT_SIZE_COMPACT : SLOT_SIZE;
  // No example sentence contains any of this word's spellings verbatim: falls back to the plain
  // meaning hint below rather than leaving the player with nothing to go on
  const exampleHint = useMemo(() => (currentItem ? findMaskedExampleHint(currentItem.word) : null), [currentItem]);

  useEffect(() => {
    setSlots([]);
    nextSlotId.current = 0;
  }, [currentIndex]);

  useEffect(() => {
    if (isSessionOver) navigation.setOptions({ headerShown: false });
  }, [isSessionOver, navigation]);

  // The "+" input is the only way to add a drawing: it creates the slot and opens its modal in
  // the same action, so no empty card is ever visible in between
  const handleAddSlot = useCallback(() => {
    const id = nextSlotId.current++;
    setSlots((prev) => [...prev, { id, image: null, strokesCount: 0 }]);
    setActiveSlotId(id);
  }, []);

  // Deleting from inside the modal (editing an existing drawing) also closes it — there is
  // nothing left to show once the drawing it was showing is gone
  const handleModalDelete = useCallback(() => {
    setSlots((prev) => prev.filter((slot) => slot.id !== activeSlotId));
    setActiveSlotId(null);
  }, [activeSlotId]);

  const handleModalDone = useCallback(
    (image: string | null, strokesCount: number) => {
      setSlots((prev) => prev.map((slot) => (slot.id === activeSlotId ? { ...slot, image, strokesCount } : slot)));
      setActiveSlotId(null);
    },
    [activeSlotId],
  );

  // Same as handleModalDone, but chains straight into a fresh slot instead of closing the modal
  const handleModalDoneAndContinue = useCallback(
    (image: string | null, strokesCount: number) => {
      const newId = nextSlotId.current++;
      setSlots((prev) => [
        ...prev.map((slot) => (slot.id === activeSlotId ? { ...slot, image, strokesCount } : slot)),
        { id: newId, image: null, strokesCount: 0 },
      ]);
      setActiveSlotId(newId);
    },
    [activeSlotId],
  );

  // Cancelling a slot that was just added (never drawn) removes it rather than leaving an empty
  // one behind; cancelling an edit on an already-drawn slot just closes the modal, unchanged
  const handleModalClose = useCallback(() => {
    setSlots((prev) => prev.filter((slot) => slot.id !== activeSlotId || slot.image !== null));
    setActiveSlotId(null);
  }, [activeSlotId]);

  const handleValidate = useCallback(async () => {
    setIsSubmitting(true);
    const expectedCharacters = getKanjiCharacters(currentItem?.word.word?.[0] ?? '');

    try {
      const resolvedSlots: WordSlotType[] = await Promise.all(
        filledSlots.map(async (slot, index) => {
          // The model only classifies into the fixed set it was trained on — calling predict()
          // for a character outside that set can only ever misclassify. No predictions routes
          // this slot's word to 'review' (updateItemSlots), for the user to arbitrate themselves.
          const expectedCharacter = expectedCharacters[index];
          if (expectedCharacter && !RECOGNITION_MODEL_LABELS.has(expectedCharacter)) {
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
  }, [filledSlots, dispatch, toast, t, currentItem]);

  if (items.length === 0 && (status === 'idle' || status === 'pending')) {
    return (
      <Layout screen="wordEvaluation">
        <View center flex>
          <ActivityIndicator color={Colors.$textPrimary} size="large" />
        </View>
      </Layout>
    );
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
              <RNView style={styles.hintBlank}>
                {exampleHint.reading && (
                  <Text style={styles.hintReading} numberOfLines={1}>
                    {exampleHint.reading}
                  </Text>
                )}
                <RNView style={[styles.hintChip, { width: Math.max(40, exampleHint.spelling.length * 22) }]} />
              </RNView>
              <Text text60M $textDefault>
                {exampleHint.suffix}
              </Text>
            </RNView>
          ) : (
            <Text h1 $textDefault>
              {currentItem?.word.definition?.[0]?.meaning?.join(', ')}
            </Text>
          )}
        </RNView>

        <RNView style={styles.spacer} />

        <RNView>
          <Text text80BO $textNeutral>
            {t('wordEvaluation.drawings.title')}
          </Text>
          <Spacing y={10} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.slotsScroll, { height: slotSize + 16 }]}
            contentContainerStyle={styles.slots}>
            {filledSlots.map((slot, index) => (
              <RNView key={slot.id} style={styles.slotWrapper}>
                <TouchableOpacity
                  style={[styles.slot, { width: slotSize, height: slotSize }]}
                  onPress={() => setActiveSlotId(slot.id)}
                  accessibilityRole="button"
                  accessibilityLabel={t('wordEvaluation.slot.accessibilityLabel')}>
                  <Image
                    source={{ uri: `data:image/png;base64,${slot.image}` }}
                    style={[styles.slotImage, { width: slotSize, height: slotSize }]}
                  />
                </TouchableOpacity>
                <RNView style={styles.slotBadge}>
                  <Text text100BO white>
                    {index + 1}
                  </Text>
                </RNView>
              </RNView>
            ))}
            <TouchableOpacity
              style={[styles.addSlot, { width: slotSize, height: slotSize }]}
              onPress={handleAddSlot}
              accessibilityRole="button">
              <Icon source={Assets.icons.add} size={28} tintColor={Colors.$iconPrimary} />
            </TouchableOpacity>
          </ScrollView>
          <Spacing y={20} />
          <Button label={t('wordEvaluation.validate')} onPress={handleValidate} disabled={isSubmitting} />
        </RNView>
      </RNView>
      <DrawSlotModal
        visible={activeSlotId !== null}
        canAddAnother={canAddAnother}
        onClose={handleModalClose}
        onDone={handleModalDone}
        onDoneAndContinue={handleModalDoneAndContinue}
        onDelete={canAddAnother ? undefined : handleModalDelete}
      />
    </Layout>
  );
}
