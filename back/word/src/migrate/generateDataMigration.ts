import axios from 'axios';

import { CreateWordDto, WordDefinitionDto } from '../word/word.dto';
import { CreateSentenceDto } from '../sentence/sentence.dto';
import { Sentence, SentenceDocument } from '../sentence/sentence.schema';

/**
 * Number of tasks that are asynchronously launched to fill the DB
 */
const N = 5;

/**
 * @param variable {Array<any> | any | undefined}
 * @returns undefined if value is null, empty or undefined or an Array
 */
const toArray = (variable: any) => {
  if (!variable) return undefined;
  if (!Array.isArray(variable)) return [variable];

  return variable;
};

/**
 * @param w {unknown}: A word from JMdict in their format containing examples (sentences)
 * @param sentenceService {unknown}
 * @returns the saved definitions
 */
const createDefinitions = async (w: any, sentenceService: any) => {
  const definitionPromises: Promise<WordDefinitionDto>[] = toArray(w.sense).map(async (s) => {
    const examplePromises: Promise<SentenceDocument>[] = [];

    // We don't know if it is defined or if it is an array so we call toArray to convert it and normalize
    toArray(s.example)?.map((e) => {
      // Format sentences with DTO to be readable
      const sentences: CreateSentenceDto = {
        sentence: e.ex_sent[0].text,
        translation: e.ex_sent[1].text,
        word: e.ex_text,
      };

      examplePromises.push(sentenceService.create(sentences));
    });

    // Waiting for all sentences to be created before returning them
    const example: Sentence[] = (await Promise.allSettled(examplePromises)).filter((res) => res.status === 'fulfilled').map((res: any) => res.value);

    return { meaning: toArray(s.gloss)?.map((g) => g.text), description: s.s_inf, related_word: toArray(s.xref), type: s.pos, example };
  });

  return (await Promise.allSettled(definitionPromises)).filter((res) => res.status === 'fulfilled').map((res: any) => res.value);
};

/**
 * @param w {unknown}: A word from JMdict in their format
 * @param wordService {unknown}
 * @param sentenceService {unknown}
 * @returns the saved sentences
 */
const createWord = async (w: any, wordService: any, sentenceService: any) => {
  const definition: WordDefinitionDto[] = await createDefinitions(w, sentenceService);
  console.log('word', w.r_ele);

  const createOne: CreateWordDto = { word: toArray(w.k_ele)?.map((k) => k.keb), reading: toArray(w.r_ele)?.map((r) => r.reb), definition };

  return wordService.create(createOne);
};

export async function migrate(wordService, sentenceService) {
  const { data } = await axios.get('http://localhost:8000/words/'); // API (FastAPI) that reads the json because the file's to large to be read with node.js

  const words: any[] = data.JMdict.entry;

  const length = words.length;
  const istart = 0;

  // Test data creation
  // const length = 1018;
  // const istart = 1000;

  let queue = [];
  for (let i = istart; i < length; i += N) {
    for (let j = 0; j < N; j++) {
      if (i + j < length) {
        queue.push(createWord(words[i + j], wordService, sentenceService));
      }
    }
    await Promise.allSettled(queue);
    queue = [];
  }
}
