import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Colors, Icon, Text, View } from 'react-native-ui-lib';

import SearchIcon from '../../components/svg/search';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import {
  search as searchKanji,
  selectSearchResult as selectKanjiSearchResult,
  selectSearchStatus as selectKanjiSearchStatus,
} from '../../store/slices/kanji';
import {
  search as searchWord,
  selectSearchResult as selectWordSearchResult,
  selectSearchStatus as selectWordSearchStatus,
} from '../../store/slices/word';
import KanjiResults from './kanjiResults';

// Waits for a pause in typing before hitting the API, so every keystroke doesn't fire a request
const DEBOUNCE_MS = 350;
const KANJI_SEGMENT = 0;
const WORD_SEGMENT = 1;

export default function Search() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToaster();

  const [query, setQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState(KANJI_SEGMENT);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const kanjiResults = useAppSelector(selectKanjiSearchResult);
  const kanjiStatus = useAppSelector(selectKanjiSearchStatus);
  const wordResults = useAppSelector(selectWordSearchResult);
  const wordStatus = useAppSelector(selectWordSearchStatus);

  const trimmedQuery = query.trim();

  // Only fetches a segment the user actually looks at: switching tabs re-uses the other
  // segment's cache-by-query if it's already there, and only dispatches when it isn't
  const runSearch = useCallback(
    (q: string, segment: number) => {
      if (q === '') return;

      if (segment === KANJI_SEGMENT) {
        if (!kanjiResults[q]) dispatch(searchKanji({ query: q }));
      } else if (!wordResults[q]) {
        dispatch(searchWord({ query: q }));
      }
    },
    [dispatch, kanjiResults, wordResults],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      const trimmed = text.trim();
      if (trimmed === '') return;

      debounceRef.current = setTimeout(() => runSearch(trimmed, activeSegment), DEBOUNCE_MS);
    },
    [runSearch, activeSegment],
  );

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery('');
  }, []);

  const handleSegmentChange = useCallback(
    (index: number) => {
      setActiveSegment(index);
      runSearch(trimmedQuery, index);
    },
    [runSearch, trimmedQuery],
  );

  const segments = useMemo(
    () => [
      { key: KANJI_SEGMENT, label: t('search.segment.kanji') },
      { key: WORD_SEGMENT, label: t('search.segment.word') },
    ],
    [t],
  );

  const activeStatus = activeSegment === KANJI_SEGMENT ? kanjiStatus : wordStatus;
  // kanjiStatus/wordStatus are global to the slice, not scoped to `trimmedQuery` — while the
  // debounce is still pending, they can still reflect a *previous* query's outcome. Whether the
  // cache already holds this exact query is what actually tells us a search for it has run.
  const activeCache = activeSegment === KANJI_SEGMENT ? kanjiResults[trimmedQuery] : wordResults[trimmedQuery];
  const activeResultCount = activeCache?.results.length ?? 0;

  useEffect(() => {
    if (activeStatus === 'failed') toast?.show({ message: t('search.error'), type: 'failure' });
  }, [activeStatus, toast, t]);

  // Clear the pending debounce timer on unmount, so it doesn't fire a search after leaving
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <View style={styles.container}>
      <RNView style={styles.searchBar}>
        {/* A plain TextInput, not react-native-ui-lib's SearchInput: typing a character into
            *either* one crashes the native bridge on this RN 0.80 New Architecture emulator setup
            (see CLAUDE.md §4) — an environment issue, not something specific to this component */}
        <RNView style={styles.searchInputContainer}>
          <SearchIcon size={18} color={Colors.$iconNeutral} />
          <TextInput
            value={query}
            onChangeText={handleChangeText}
            placeholder={t('home.search.placeholder')}
            placeholderTextColor={Colors.$textNeutral}
            style={styles.searchInput}
          />
          {activeStatus === 'pending' ? (
            <ActivityIndicator color={Colors.$textPrimary} size="small" />
          ) : (
            query !== '' && (
              <TouchableOpacity onPress={handleClear} accessibilityRole="button" accessibilityLabel={t('search.clear')}>
                <Icon source={Assets.icons.clear} size={18} tintColor={Colors.$iconNeutral} />
              </TouchableOpacity>
            )
          )}
        </RNView>
      </RNView>
      <RNView style={styles.segmentedControl}>
        {segments.map((segment) => {
          const isActive = segment.key === activeSegment;

          return (
            <TouchableOpacity
              key={segment.key}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => handleSegmentChange(segment.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>{segment.label}</Text>
            </TouchableOpacity>
          );
        })}
      </RNView>
      {trimmedQuery === '' ? (
        <RNView style={styles.body}>
          <Text text80M $textGeneral center>
            {t('search.empty.message')}
          </Text>
        </RNView>
      ) : activeStatus === 'failed' && !activeCache ? (
        // A failed request never populates the cache, so it would otherwise fall into the
        // "no cache yet" branch below and spin forever instead of reflecting the failure
        <RNView style={styles.body}>
          <Text text80M $textGeneral center>
            {t('search.error')}
          </Text>
        </RNView>
      ) : !activeCache ? (
        // No cache yet for this exact query (still debouncing, or the fetch is in flight):
        // avoid flashing "no results" using a previous query's leftover status
        <RNView style={styles.body}>
          <ActivityIndicator color={Colors.$textPrimary} size="small" />
        </RNView>
      ) : activeResultCount === 0 ? (
        <RNView style={styles.body}>
          <Text text80M $textGeneral center>
            {t('search.noResults', { query: trimmedQuery })}
          </Text>
        </RNView>
      ) : activeSegment === KANJI_SEGMENT ? (
        <RNView style={styles.listContainer}>
          <KanjiResults query={trimmedQuery} />
        </RNView>
      ) : (
        // Word results land in a follow-up: kanji comes first
        <RNView style={styles.body}>
          <Text text70M>{t('search.resultCount', { count: activeResultCount })}</Text>
        </RNView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.$backgroundDefault,
  },
  searchBar: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderColor: Colors.$outlineNeutral,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.$textDefault,
    padding: 0,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 4,
    gap: 4,
    backgroundColor: Colors.$backgroundNeutralMedium,
    borderRadius: 25,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.$backgroundPrimaryHeavy,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.$textNeutral,
  },
  segmentLabelActive: {
    color: '#fff',
  },
  body: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
    marginTop: 8,
  },
});
