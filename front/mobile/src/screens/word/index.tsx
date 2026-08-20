import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View as RNView } from 'react-native';
import { ActionSheet, Assets, Button, Colors, ProgressBar, Text } from 'react-native-ui-lib';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { getAccuracyPercent, PROGRESSION_MASTERY_THRESHOLD_PERCENT } from '../../constants/progression';
import { screenNames } from '../../constants/screens';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import { core } from '../../services/http';
import { search as searchKanji, selectSearchResult } from '../../store/slices/kanji';
import { selectUserState } from '../../store/slices/user';
import { getKanjiCharacters } from '../../store/slices/wordEvaluation';
import { saveActiveListSelection, selectWordLists, selectWordListsSaveStatus, wordLists } from '../../store/slices/wordLists';
import WordListPickerDialog from '../wordLists/components/wordListPickerDialog';
import { useWordDetailStyles } from './useWordDetailStyles';

type WordDetailProps = RouteParamsProps<{ id: string }>;

// Highlights whichever spelling of the word actually shows up in the example sentence — kanji and
// kana spellings don't both appear, so only one (if any) will ever match
function renderHighlightedSentence(sentence: string | undefined, spellings: string[]) {
  if (!sentence) return sentence;

  const match = spellings.find((spelling) => spelling && sentence.includes(spelling));
  if (!match) return sentence;

  return sentence.split(match).flatMap((part, index, parts) =>
    index < parts.length - 1
      ? [
          part,
          <Text key={index} text90BO $textPrimary>
            {match}
          </Text>,
        ]
      : [part],
  );
}

export default function WordDetail(props: WordDetailProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { id } = props.route.params;
  const styles = useWordDetailStyles();

  const toaster = useToaster();

  const [word, setWord] = useState<WordType | null>(null);
  const [status, setStatus] = useState<RequestStatusType>('pending');
  const [isListPickerVisible, setIsListPickerVisible] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const searchResults = useAppSelector(selectSearchResult);
  const userState = useAppSelector(selectUserState);
  const allWordLists = useAppSelector(selectWordLists);
  const wordListsSaveStatus = useAppSelector(selectWordListsSaveStatus);

  useEffect(() => {
    setStatus('pending');
    core
      .wordService!.getOne({ id })
      .then((response) => {
        setWord(response.data);
        setStatus('succeeded');
      })
      .catch(() => setStatus('failed'));
  }, [id]);

  const characters = useMemo(() => (word ? Array.from(new Set(getKanjiCharacters(word.word[0] ?? ''))) : []), [word]);

  useEffect(() => {
    characters.forEach((character) => {
      dispatch(searchKanji({ query: character, limit: 5 }));
    });
  }, [characters, dispatch]);

  // The detail screen is keyed by kanji_id, not the glyph itself — a word only carries the
  // character, so its real kanji_id has to be resolved through search before navigating
  const kanjiIdByCharacter = useMemo(() => {
    const map: Record<string, string> = {};
    characters.forEach((character) => {
      const match = searchResults[character]?.results.find((entry) => entry.kanji?.character === character);
      if (match?.kanji_id) map[character] = match.kanji_id;
    });
    return map;
  }, [characters, searchResults]);

  const handlePressKanji = (character: string) => {
    const kanjiId = kanjiIdByCharacter[character];
    if (!kanjiId) return;
    navigation.navigate(screenNames.KANJI, { character: kanjiId });
  };

  // Always ask which list rather than silently acting on whatever happened to still be active —
  // this screen is reached from search or from a kanji's related words, not necessarily right
  // after picking a word list, so a stale active list could easily be the wrong one
  const handleAddToList = useCallback(() => {
    if (!word) return;
    setIsListPickerVisible(true);
  }, [word]);

  const handleListPicked = useCallback(
    (id: string) => {
      setIsListPickerVisible(false);
      dispatch(wordLists.actions.setActiveList(id));

      if (!word) return;

      const alreadyInChosenList = !!allWordLists[id]?.wordIds.includes(word.word_id);
      dispatch(
        alreadyInChosenList ? wordLists.actions.unSelectWordForActiveList(word) : wordLists.actions.selectWordForActiveList(word),
      );
      setShowSaveModal(true);
    },
    [dispatch, word, allWordLists],
  );

  const handleConfirmSave = useCallback(() => {
    dispatch(saveActiveListSelection());
    setShowSaveModal(false);
  }, [dispatch]);

  const handleCancelSave = useCallback(() => {
    dispatch(wordLists.actions.cancelActiveListSelection());
    setShowSaveModal(false);
  }, [dispatch]);

  useEffect(() => {
    if (!toaster) return;
    if (wordListsSaveStatus === 'succeeded') {
      toaster.show({ message: t('word.select.toast.success'), type: 'success' });
      dispatch(wordLists.actions.resetSaveStatus());
      setShowSaveModal(false);
    }
    if (wordListsSaveStatus === 'failed') {
      setShowSaveModal(false);
    }
  }, [wordListsSaveStatus, toaster, dispatch, t]);

  // Below the 20-attempt minimum (including zero answers), the real percentage isn't meaningful
  // yet — shown as an empty 0% bar rather than hiding the section entirely, same as kanji detail
  const displayPercent = word ? (getAccuracyPercent(userState.wordProgression[word.word_id]) ?? 0) : 0;

  return (
    <Layout
      screen="wordDetails"
      loadingMessage={status === 'pending' ? t('loading.title') : undefined}
      errorMessage={status === 'failed' || !word ? t('wordDetails.error') : undefined}>
      {word && (
        <>
          <RNView style={styles.wordRow}>
            {word.word.map((spelling) => (
              <Text key={spelling} text50BL $textPrimary center>
                {spelling}
              </Text>
            ))}
          </RNView>
          <Spacing y={16} />
          <RNView style={styles.actions}>
            <Button
              iconSource={Assets.icons.add}
              iconProps={{ size: 20 }}
              label={t('wordDetails.addToList.button')}
              onPress={handleAddToList}
              outline
            />
          </RNView>
          <Spacing y={14} />
          <Text text90M $textNeutral>
            {t('wordDetails.readings')}
          </Text>
          <Spacing y={6} />
          <RNView style={styles.chipRow}>
            {word.reading.map((reading) => (
              <RNView key={reading} style={styles.chip}>
                <Text text80M $textPrimary>
                  {reading}
                </Text>
              </RNView>
            ))}
          </RNView>
          <Spacing y={10} />
          <Text text90M $textNeutral>
            {t('wordDetails.definitions')}
          </Text>
          <Spacing y={6} />
          {word.definition.map((definition, index) => (
            <RNView key={index} style={styles.definitionRow}>
              <Text text80M $textDefault>
                {definition.meaning.join(', ')}
              </Text>
              {definition.example?.map((example, exampleIndex) => (
                <RNView key={example.sentence_id ?? exampleIndex} style={styles.exampleRow}>
                  <Text text90M $textDefault>
                    {renderHighlightedSentence(example.sentence, word.word)}
                  </Text>
                  <Text text90M $textNeutral>
                    {example.translation}
                  </Text>
                </RNView>
              ))}
            </RNView>
          ))}

          <Spacing y={20} />
          <RNView style={styles.masteryRow}>
            <Text text90M $textNeutral>
              {t('wordDetails.mastery.title')}
            </Text>
            <Text
              text90BO
              style={{
                color: displayPercent > PROGRESSION_MASTERY_THRESHOLD_PERCENT ? Colors.$textSuccess : Colors.$textPrimary,
              }}>
              {displayPercent}%
            </Text>
          </RNView>
          <Spacing y={4} />
          <ProgressBar
            progress={displayPercent}
            style={{ backgroundColor: Colors.$backgroundNeutralMedium }}
            progressColor={
              displayPercent > PROGRESSION_MASTERY_THRESHOLD_PERCENT
                ? Colors.$backgroundSuccessHeavy
                : Colors.$backgroundPrimaryHeavy
            }
          />

          {characters.length > 0 && (
            <>
              <Spacing y={20} />
              <Text text70BO>{t('wordDetails.kanji.title')}</Text>
              <Spacing y={4} />
              <Text text90M $textNeutral>
                {t('wordDetails.kanji.subtitle')}
              </Text>
              <Spacing y={12} />
              <RNView style={styles.chipRow}>
                {characters.map((character) => (
                  <TouchableOpacity
                    key={character}
                    onPress={() => handlePressKanji(character)}
                    style={styles.kanjiTile}
                    accessibilityRole="button"
                    accessibilityLabel={t('wordDetails.kanji.viewDetail', { character })}>
                    <Text text50BL center $textDefault>
                      {character}
                    </Text>
                  </TouchableOpacity>
                ))}
              </RNView>
            </>
          )}
        </>
      )}
      <ActionSheet
        visible={showSaveModal}
        title={t('wordLists.saveConfirm.title')}
        cancelButtonIndex={2}
        destructiveButtonIndex={0}
        options={[
          { label: t('lists.form.save'), onPress: handleConfirmSave },
          { label: t('lists.form.cancel'), onPress: handleCancelSave },
        ]}
      />
      <WordListPickerDialog
        visible={isListPickerVisible}
        lists={Object.values(allWordLists)}
        onSelect={handleListPicked}
        onClose={() => setIsListPickerVisible(false)}
      />
    </Layout>
  );
}
