export function getKanjiList(sentence: string) {
  return sentence.match(/[\u4e00-\u9fff]/g);
}
