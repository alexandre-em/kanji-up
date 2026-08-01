import { TFunction } from 'i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

type DifficultyTier = 'easy' | 'medium' | 'hard';

export type Tag = {
  label: string;
  tier: DifficultyTier;
};

// Reuses the same three-tier semantic colors as the evaluation result screen (success/warning/
// primary for correct/doubtful/invalid), so "difficulty" reads with the same vocabulary app-wide
const TIER_COLORS: Record<DifficultyTier, { background: string; text: string }> = {
  easy: { background: Colors.$backgroundSuccessLight, text: Colors.$textSuccess },
  medium: { background: Colors.$backgroundWarningLight, text: Colors.$textWarning },
  hard: { background: Colors.$backgroundPrimaryLight, text: Colors.$textPrimary },
};

// Grade follows the KANJIDIC convention: 1-6 = elementary school year, 8-10 = junior high /
// name kanji, all folded into a single "junior high" tag since the app doesn't distinguish them
export function getGradeTag(grade: string | undefined, t: TFunction): Tag | undefined {
  const value = Number(grade);
  if (!value) return undefined;
  if (value <= 3) return { label: t('search.tag.elementary', { grade: value }), tier: 'easy' };
  if (value <= 6) return { label: t('search.tag.elementary', { grade: value }), tier: 'medium' };
  return { label: t('search.tag.juniorHigh'), tier: 'hard' };
}

// JLPT runs the opposite direction: N5 is the easiest level, N1 the hardest.
// Not called from kanjiResultCard for now — the search endpoint doesn't return `jlpt` yet
// (backend dette, see CLAUDE.md §4) — kept here ready for when that's fixed.
export function getJlptTag(jlpt: number | undefined, t: TFunction): Tag | undefined {
  if (!jlpt) return undefined;
  const label = t('search.tag.jlpt', { level: jlpt });
  if (jlpt >= 4) return { label, tier: 'easy' };
  if (jlpt === 3) return { label, tier: 'medium' };
  return { label, tier: 'hard' };
}

export default function DifficultyTag({ tag }: { tag: Tag }) {
  const colors = TIER_COLORS[tag.tier];

  return (
    <RNView style={[styles.tag, { backgroundColor: colors.background }]}>
      <Text text100M style={{ color: colors.text }}>
        {tag.label}
      </Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});
