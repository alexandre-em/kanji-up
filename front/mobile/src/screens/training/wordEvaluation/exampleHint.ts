import { KANJI_REGEX } from '../../../store/slices/wordEvaluation';

export type SpellingSegment = { text: string; isKanji: boolean };

export type MaskedExampleHint = {
  prefix: string;
  suffix: string;
  segments: SpellingSegment[];
  reading: string | null;
};

// Only the kanji runs are what the player actually draws — any okurigana/kana mixed into the
// spelling (e.g. 食べる) has nothing to draw, so it stays visible as plain text between blanks
// instead of being masked along with the kanji.
function splitIntoSegments(spelling: string): SpellingSegment[] {
  const segments: SpellingSegment[] = [];

  for (const character of spelling) {
    const isKanji = KANJI_REGEX.test(character);
    const last = segments[segments.length - 1];

    if (last && last.isKanji === isKanji) {
      last.text += character;
    } else {
      segments.push({ text: character, isKanji });
    }
  }

  return segments;
}

// Picks a random example sentence (across all definitions) that literally contains one of the
// word's spellings, so it can be masked out and replaced by a blank the player has to draw.
// `word.word[i]`/`word.reading[i]` are assumed paired by index (matches how the dictionary data is
// authored — see the word detail screen's spelling/reading chips).
export function findMaskedExampleHint(word: Partial<WordType>): MaskedExampleHint | null {
  const spellings = word.word ?? [];
  const readings = word.reading ?? [];

  const hints: MaskedExampleHint[] = [];

  for (const definition of word.definition ?? []) {
    for (const example of definition.example ?? []) {
      const sentence = example.sentence;
      if (!sentence) continue;

      for (let i = 0; i < spellings.length; i++) {
        const spelling = spellings[i];
        const matchIndex = sentence.indexOf(spelling);
        if (matchIndex === -1) continue;

        hints.push({
          prefix: sentence.slice(0, matchIndex),
          suffix: sentence.slice(matchIndex + spelling.length),
          segments: splitIntoSegments(spelling),
          reading: readings[i] ?? readings[0] ?? null,
        });
        break;
      }
    }
  }

  if (hints.length === 0) return null;
  return hints[Math.floor(Math.random() * hints.length)];
}
