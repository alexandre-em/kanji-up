import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-ui-lib';

import { useFlashcardStyles } from '../hooks/useFlashcardStyles';

export type FlashcardKind = 'kanji' | 'word';

type FlashcardProps = {
  kind: FlashcardKind;
  item: Partial<KanjiType> | Partial<WordType>;
  isRevealed: boolean;
  onReveal: () => void;
  revealHint: string;
};

export default function Flashcard({ kind, item, isRevealed, onReveal, revealHint }: FlashcardProps) {
  const styles = useFlashcardStyles();
  const kanji = kind === 'kanji' ? (item as Partial<KanjiType>) : undefined;
  const word = kind === 'word' ? (item as Partial<WordType>) : undefined;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onReveal}
      disabled={isRevealed}
      accessibilityRole="button"
      accessibilityLabel={revealHint}>
      <Text style={kind === 'kanji' ? styles.character : styles.wordCharacter} $textDefault center>
        {kind === 'kanji' ? kanji?.kanji?.character : word?.word?.[0]}
      </Text>
      {isRevealed ? (
        kind === 'kanji' ? (
          <>
            <Text text60BO $textPrimary center>
              {kanji?.kanji?.meaning?.join(', ')}
            </Text>
            {!!kanji?.kanji?.onyomi?.length && (
              <Text text80M $textNeutral center>
                ON — {kanji.kanji.onyomi.join('、')}
              </Text>
            )}
            {!!kanji?.kanji?.kunyomi?.length && (
              <Text text80M $textNeutral center>
                KUN — {kanji.kanji.kunyomi.join('、')}
              </Text>
            )}
          </>
        ) : (
          <>
            {!!word?.reading?.length && (
              <Text text80M $textNeutral center>
                {word.reading.join('、')}
              </Text>
            )}
            {!!word?.definition?.[0]?.meaning?.length && (
              <Text text60BO $textPrimary center>
                {word.definition[0].meaning.join(', ')}
              </Text>
            )}
          </>
        )
      ) : (
        <Text style={styles.hint} text90M $textNeutral center>
          {revealHint}
        </Text>
      )}
    </TouchableOpacity>
  );
}
