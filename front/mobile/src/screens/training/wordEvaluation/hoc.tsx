import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TouchableOpacity, View as RNView } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useRecognitionModel } from '../../../hooks/useRecognitionModel';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { getOne, search as searchKanji, selectEntities, selectSearchResult } from '../../../store/slices/kanji';
import { lists, selectActiveList, selectLists } from '../../../store/slices/lists';
import { getOne as getOneWord, selectGetOne as selectWordEntities } from '../../../store/slices/word';
import { getKanjiCharacters, init, selectWordEvaluationItems, WordEvaluationKind } from '../../../store/slices/wordEvaluation';
import { selectActiveWordList, selectWordLists, wordLists } from '../../../store/slices/wordLists';
import ActiveListSelector from '../../kanji/difficulty/kanjiList/components/activeListSelector';
import ActiveWordListSelector from '../../wordLists/components/activeWordListSelector';
import WordEvaluationScreen from '.';
import { useWordEvaluationPickerStyles } from './hooks/useWordEvaluationPickerStyles';

const NUMBER_OF_WORDS = 10;
const KANJI_KIND: WordEvaluationKind = 'kanji';
const WORD_KIND: WordEvaluationKind = 'word';

export default function WordEvaluationHoc() {
  const dispatch = useAppDispatch();
  const { isLoaded: isModelLoaded, hasError: modelLoadError } = useRecognitionModel();
  const toast = useToaster();
  const { t } = useTranslation();
  const styles = useWordEvaluationPickerStyles();

  const [kind, setKind] = useState<WordEvaluationKind>(KANJI_KIND);
  const isKanji = kind === KANJI_KIND;

  const activeKanjiList = useAppSelector(selectActiveList);
  const allKanjiLists = useAppSelector(selectLists);
  const kanjiEntities = useAppSelector(selectEntities);

  const activeWordList = useAppSelector(selectActiveWordList);
  const allWordLists = useAppSelector(selectWordLists);
  const wordEntities = useAppSelector(selectWordEntities);

  const activeList = isKanji ? activeKanjiList : activeWordList;

  useEffect(() => {
    if (modelLoadError) toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
  }, [modelLoadError, toast]);

  // Kanji mode needs the list's kanji entities to build the character seed for the practice-word
  // API call; word mode needs the word entities themselves, since those ARE the practice set
  useEffect(() => {
    if (isKanji) {
      activeKanjiList?.kanjiIds.forEach((id) => {
        if (!kanjiEntities[id]) dispatch(getOne(id));
      });
    } else {
      activeWordList?.wordIds.forEach((id) => {
        if (!wordEntities[id]) dispatch(getOneWord(id));
      });
    }
  }, [isKanji, activeKanjiList, activeWordList, kanjiEntities, wordEntities, dispatch]);

  const isPoolReady = isKanji
    ? !!activeKanjiList && activeKanjiList.kanjiIds.every((id) => !!kanjiEntities[id])
    : !!activeWordList && activeWordList.wordIds.every((id) => !!wordEntities[id]);

  useEffect(() => {
    if (!isPoolReady) return;
    void dispatch(init({ kind, number: NUMBER_OF_WORDS }));
  }, [isPoolReady, kind, activeList?.id, dispatch]);

  // Whichever mode built the practice set, the kanji actually drawn during the run can include
  // characters outside any list (see wordEvaluation.ts's updateItemSlots) — resolved here so
  // their stroke counts are ready before the user reaches them
  const items = useAppSelector(selectWordEvaluationItems);
  const searchResults = useAppSelector(selectSearchResult);

  const practiceCharacters = useMemo(
    () => Array.from(new Set(items.flatMap((item) => getKanjiCharacters(item.word.word?.[0] ?? '')))),
    [items],
  );

  useEffect(() => {
    practiceCharacters.forEach((character) => {
      if (!searchResults[character]) dispatch(searchKanji({ query: character, limit: 5 }));
    });
  }, [practiceCharacters, searchResults, dispatch]);

  const isCharacterPoolReady = practiceCharacters.every((character) => !!searchResults[character]);

  const segments: { key: WordEvaluationKind; label: string }[] = [
    { key: KANJI_KIND, label: t('history.segment.kanji') },
    { key: WORD_KIND, label: t('history.segment.word') },
  ];

  const picker = (
    <>
      <RNView style={styles.segmentedControl}>
        {segments.map((segment) => {
          const isActive = segment.key === kind;

          return (
            <TouchableOpacity
              key={segment.key}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => setKind(segment.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Text style={{ color: isActive ? '#fff' : Colors.$textNeutral }}>{segment.label}</Text>
            </TouchableOpacity>
          );
        })}
      </RNView>
      <Spacing y={16} />
      {isKanji ? (
        <ActiveListSelector
          lists={Object.values(allKanjiLists)}
          activeList={activeKanjiList}
          onSelect={(id) => dispatch(lists.actions.setActiveList(id))}
        />
      ) : (
        <ActiveWordListSelector
          lists={Object.values(allWordLists)}
          activeList={activeWordList}
          onSelect={(id) => dispatch(wordLists.actions.setActiveList(id))}
        />
      )}
    </>
  );

  if (!activeList) {
    return (
      <Layout screen="wordEvaluation">
        {picker}
        <Spacing y={16} />
        <View center flex>
          <Text text70BO $textDefault center>
            {t('wordEvaluation.noList.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('wordEvaluation.noList.message')}
          </Text>
        </View>
      </Layout>
    );
  }

  if (!isModelLoaded || !isPoolReady || !isCharacterPoolReady) {
    return (
      <Layout screen="wordEvaluation">
        {picker}
        <Spacing y={16} />
        <View center flex>
          <ActivityIndicator color={Colors.$backgroundPrimaryHeavy} size="large" />
          <Spacing y={12} />
          <Text $textDefault>{t('evaluation.loadingModel')}</Text>
        </View>
      </Layout>
    );
  }

  return <WordEvaluationScreen />;
}
