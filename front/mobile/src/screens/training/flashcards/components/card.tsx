import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-ui-lib';

import { useFlashcardStyles } from '../hooks/useFlashcardStyles';

type FlashcardProps = {
  kanji: Partial<KanjiType>;
  isRevealed: boolean;
  onReveal: () => void;
  revealHint: string;
};

export default function Flashcard({ kanji, isRevealed, onReveal, revealHint }: FlashcardProps) {
  const styles = useFlashcardStyles();

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
