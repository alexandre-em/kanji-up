import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { screenNames } from '../../constants/screens';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { search, selectSearchResult, selectSearchStatus } from '../../store/slices/kanji';
import KanjiResultCard from './kanjiResultCard';

type KanjiResultsProps = {
  query: string;
  /** Extra clearance below the last row — the floating tab bar overlays this list on top */
  bottomPadding?: number;
};

export default function KanjiResults({ query, bottomPadding = 0 }: KanjiResultsProps) {
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
    (kanji: Partial<KanjiType>) => {
      navigation.navigate(screenNames.KANJI as never, { character: kanji.kanji_id } as never);
    },
    [navigation],
  );

  if (!cache) return null;

  return (
    <FlashList
      data={cache.results}
      keyExtractor={(item, index) => `${item.kanji_id}-${index}`}
      renderItem={({ item }) => <KanjiResultCard kanji={item} onPress={() => handlePress(item)} />}
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
