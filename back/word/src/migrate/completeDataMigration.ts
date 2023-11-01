import { Word, WordDocument } from '../word/word.schema';
import { WordService } from '../word/word.service';

/**
 * Number of tasks that are asynchronously launched to fill the DB
 */
const N = 5;

/**
 * @description Allows to format the "raw" related_word field to have relation with the word and the index of the word/reading
 * @param def {Definition}
 * @returns relation {WordRelation}
 */
function splitRawRelatedWord(def) {
  const indexedRW = [];

  // Visiting each related_word to split each item to have the word/reading and the index
  def.related_word.forEach((rw) => {
    const splitedArr = rw.split('・');

    for (let i = 0; i < splitedArr.length; i++) {
      if (isNaN(splitedArr[i] as any)) {
        indexedRW.push({ word: splitedArr[i], index: null });
      } else {
        indexedRW[indexedRW.length - 1].index = parseInt(splitedArr[i]) - 1;
      }
    }
  });
  return indexedRW;
}

const updateDefinitions = async (word: WordDocument, wordService: WordService) => {
  let rWPromise = [];
  let updatePromise = [];

  updatePromise = word.definition.map(async (def) => {
    if (def.related_word && def.related_word.length > 0) {
      const indexedRW = splitRawRelatedWord(def);
      rWPromise = indexedRW.map(async (irw, i) => {
        const wRes = await wordService.findWordReadingQuery(irw.word, word.word_id);
        const rw: { index: number | null; related_word: Word }[] = [];

        wRes.every((w2: Word) => {
          if (indexedRW[i].index !== null) {
            if (w2.word.length >= indexedRW[i].index + 1 || w2.reading.length >= indexedRW[i].index + 1) {
              rw.push({ related_word: w2, index: indexedRW[i].index });
              return false;
            }

            return true;
          } else {
            rw.push({ related_word: w2, index: null });
            return false;
          }
        });

        return rw[0];
      });
      const rwPromiseResults = await Promise.allSettled(rWPromise);

      const rwResults = rwPromiseResults.map((v) => (v.status === 'fulfilled' ? v.value : null));

      def.relation = rwResults as { index: number | null; related_word: Word }[];
    }
    return def;
  });

  const defPromises = await Promise.allSettled(updatePromise);

  const defResult = defPromises
    .filter((dfP) => dfP.status === 'fulfilled')
    .map((v) => {
      if (v.status === 'fulfilled') {
        return v.value;
      }
      return null;
    });

  word.definition = defResult;

  return word.save();
};

export async function completeMigration(wordService: WordService) {
  const words = await wordService.findWordWithRelatedWord();

  // Visit each words
  // Visit each word's definitions
  // split related_word if not null with '・'
  // map them with the format : { "related_word": string, "index": number | null } (index = i - 1)

  let queue = [];
  for (let indexWord = 0; indexWord < words.length; indexWord += N) {
    for (let j = 0; j < N; j++) {
      if (indexWord + j < words.length) {
        console.log('i', indexWord + j);
        queue.push(updateDefinitions(words[indexWord + j], wordService));
      }
    }
    await Promise.allSettled(queue);
    queue = [];
  }
}
