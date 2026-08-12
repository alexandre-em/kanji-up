import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { screenNames } from '../../constants/screens';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { search, selectSearchResult, selectSearchStatus } from '../../store/slices/word';
import WordResultCard from './components/wordResultCard';

type WordResultsProps = {
  query: string;
  /** Extra clearance below the last row — the floating tab bar overlays this list on top */
  bottomPadding?: number;
};

export default function WordResults({ query, bottomPadding = 0 }: WordResultsProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const results = useAppSelector(selectSearchResult);
  const status = useAppSelector(selectSearchStatus);

  const cache = results[query];

  const handleEndReached = useCallback(() => {
    if (!cache || cache.current >= cache.totalPages || status === 'pending') return;
    dispatch(search({ query, page: cache.current + 1 }));
  }, [cache, status, dispatch, query]);

  const handlePress = useCallback(
    (word: WordType) => {
      navigation.navigate(screenNames.WORD as never, { id: word.word_id } as never);
    },
    [navigation],
  );

  if (!cache) return null;

  return (
    <FlashList
      data={cache.results}
      keyExtractor={(item, index) => `${item.word_id}-${index}`}
      renderItem={({ item }) => <WordResultCard word={item} onPress={() => handlePress(item)} />}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      contentContainerStyle={[styles.listContent, { paddingBottom: 20 + bottomPadding }]}
      ListFooterComponent={
        status === 'pending' && cache.current > 0 ? (
          <RNView style={styles.footer}>
            <ActivityIndicator color={Colors.$backgroundPrimaryHeavy} size="small" />
            <Text text90M $textNeutral>
              {t('loading.title')}
            </Text>
          </RNView>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
});
