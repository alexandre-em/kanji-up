import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TouchableOpacity, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import {
  fetchSessionHistory,
  selectSessionHistoryHasMore,
  selectSessionHistoryItems,
  selectSessionHistoryStatus,
} from '../../../store/slices/sessionHistory';
import { selectUserState } from '../../../store/slices/user';
import SessionHistoryItem from './components/sessionHistoryItem';
import { useHistoryScreenStyles } from './hooks/useHistoryScreenStyles';

const KANJI_SEGMENT: SessionKind = 'kanji';
const WORD_SEGMENT: SessionKind = 'word';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const styles = useHistoryScreenStyles();
  const userState = useAppSelector(selectUserState);
  const itemsByType = useAppSelector(selectSessionHistoryItems);
  const hasMoreByType = useAppSelector(selectSessionHistoryHasMore);
  const status = useAppSelector(selectSessionHistoryStatus);
  const [activeSegment, setActiveSegment] = useState<SessionKind>(KANJI_SEGMENT);

  const items = itemsByType[activeSegment];
  const hasMore = hasMoreByType[activeSegment];

  // Word isn't tracked server-side yet (see wordEvaluation), so only kanji ever fetches
  useEffect(() => {
    if (activeSegment === KANJI_SEGMENT && items.length === 0 && userState.userId) {
      dispatch(fetchSessionHistory({ userId: userState.userId, type: KANJI_SEGMENT }));
    }
  }, [activeSegment, items.length, userState.userId, dispatch]);

  const handleEndReached = useCallback(() => {
    if (activeSegment !== KANJI_SEGMENT || !hasMore || status === 'pending') return;
    dispatch(fetchSessionHistory({ userId: userState.userId, type: KANJI_SEGMENT }));
  }, [activeSegment, hasMore, status, userState.userId, dispatch]);

  const segments: { key: SessionKind; label: string }[] = [
    { key: KANJI_SEGMENT, label: t('history.segment.kanji') },
    { key: WORD_SEGMENT, label: t('history.segment.word') },
  ];

  return (
    <Layout screen="history">
      <RNView style={styles.segmentedControl}>
        {segments.map((segment) => {
          const isActive = segment.key === activeSegment;

          return (
            <TouchableOpacity
              key={segment.key}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => setActiveSegment(segment.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Text style={{ color: isActive ? '#fff' : Colors.$textNeutral }}>{segment.label}</Text>
            </TouchableOpacity>
          );
        })}
      </RNView>
      <Spacing y={16} />
      {activeSegment === WORD_SEGMENT ? (
        <RNView style={styles.empty}>
          <Text text70BO $textDefault center>
            {t('history.word.notTracked.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('history.word.notTracked.message')}
          </Text>
        </RNView>
      ) : items.length === 0 && status !== 'pending' ? (
        <RNView style={styles.empty}>
          <Text text70BO $textDefault center>
            {t('history.empty.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('history.empty.message')}
          </Text>
        </RNView>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.sessionId}
          renderItem={({ item }) => <SessionHistoryItem session={item} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            status === 'pending' ? (
              <RNView style={styles.footer}>
                <ActivityIndicator color={Colors.$backgroundPrimaryHeavy} size="small" />
                <Text text90M $textNeutral>
                  {t('loading.title')}
                </Text>
              </RNView>
            ) : null
          }
        />
      )}
    </Layout>
  );
}
