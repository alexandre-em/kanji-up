import { StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../hooks/useThemedStyles';

type FlashcardProps = {
  kanji: Partial<KanjiType>;
  isRevealed: boolean;
  onReveal: () => void;
  revealHint: string;
};

export default function Flashcard({ kanji, isRevealed, onReveal, revealHint }: FlashcardProps) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      card: {
        minHeight: 280,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.$outlineNeutral,
        backgroundColor: Colors.$backgroundNeutralLight,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      },
      character: {
        fontSize: 96,
      },
      hint: {
        marginTop: 8,
      },
    }),
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onReveal}
      disabled={isRevealed}
      accessibilityRole="button"
      accessibilityLabel={revealHint}>
      <Text style={styles.character} $textDefault>
        {kanji.kanji?.character}
      </Text>
      {isRevealed ? (
        <>
          <Text text60BO $textPrimary center>
            {kanji.kanji?.meaning?.join(', ')}
          </Text>
          {!!kanji.kanji?.onyomi?.length && (
            <Text text80M $textNeutral center>
              ON — {kanji.kanji.onyomi.join('、')}
            </Text>
          )}
          {!!kanji.kanji?.kunyomi?.length && (
            <Text text80M $textNeutral center>
              KUN — {kanji.kanji.kunyomi.join('、')}
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.hint} text90M $textNeutral center>
          {revealHint}
        </Text>
      )}
    </TouchableOpacity>
  );
}
