import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import AccountSummary from '../../components/accountSummary';
import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { isKanjiMastered } from '../../constants/progression';
import { localDateKey, selectUserState } from '../../store/slices/user';
import StatCard from './components/statCard';

const RECENT_DAYS = 7;
const CHART_HEIGHT = 100;

export default function Profile() {
  const { t, i18n } = useTranslation();
  const userState = useSelector(selectUserState);

  const masteredCount = Object.values(userState.progression).filter(isKanjiMastered).length;
  const hasAnyActivity = userState.totalScore > 0 || Object.keys(userState.progression).length > 0;

  // Fixed 7-day window (today + 6 previous days), not just the sparse days with an entry — a flat
  // week reads as clearly as a busy one, rather than silently collapsing gaps
  const recentDays = Array.from({ length: RECENT_DAYS }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (RECENT_DAYS - 1 - index));
    return { date, score: userState.dailyScores[localDateKey(date)] ?? 0 };
  });
  const maxScore = Math.max(...recentDays.map((day) => day.score), 1);

  return (
    <Layout screen="profile" withTabBar>
      <AccountSummary />
      <Spacing y={28} />

      {!hasAnyActivity ? (
        <RNView style={styles.empty}>
          <Text text70BO $textDefault center>
            {t('profile.empty.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('profile.empty.message')}
          </Text>
        </RNView>
      ) : (
        <>
          <RNView style={styles.statsRow}>
            <StatCard value={userState.totalScore} label={t('profile.stats.totalScore')} />
            <StatCard value={masteredCount} label={t('profile.stats.mastered')} />
            <StatCard value={userState.credits} label={t('profile.stats.credits')} />
          </RNView>

          <Spacing y={28} />
          <Text text70BO $textDefault>
            {t('profile.unlocked.title')}
          </Text>
          <Spacing y={12} />
          <RNView style={styles.unlockedRow}>
            <Text text80M $textDefault>
              {t('profile.unlocked.kanji', { count: userState.unlockedKanji.length })}
            </Text>
            <Text text80M $textDefault>
              {t('profile.unlocked.difficulties', { count: userState.unlockedDifficulties.length })}
            </Text>
          </RNView>

          <Spacing y={28} />
          <Text text70BO $textDefault>
            {t('profile.activity.title')}
          </Text>
          <Spacing y={16} />
          <RNView style={styles.chart}>
            {recentDays.map((day) => (
              <RNView key={day.date.toDateString()} style={styles.chartColumn}>
                <Text text100L $textNeutral>
                  {day.score > 0 ? day.score : ''}
                </Text>
                <Spacing y={4} />
                <RNView style={styles.chartTrack}>
                  <RNView
                    style={[
                      styles.chartBar,
                      {
                        height: Math.max((day.score / maxScore) * CHART_HEIGHT, day.score > 0 ? 4 : 0),
                        backgroundColor: Colors.$backgroundPrimaryHeavy,
                      },
                    ]}
                  />
                </RNView>
                <Spacing y={6} />
                <Text text100L $textNeutral>
                  {day.date.toLocaleDateString(i18n.language, { weekday: 'short' })}
                </Text>
              </RNView>
            ))}
          </RNView>
        </>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unlockedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartTrack: {
    height: CHART_HEIGHT,
    width: 18,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 18,
    borderRadius: 6,
  },
});
