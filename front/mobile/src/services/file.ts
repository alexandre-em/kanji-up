export const fileNames = {
  SELECTED_KANJI: 'selectedKanji',
  SELECTED_WORD: 'selectedWord',
  USER_SCORES: 'userScores',
};

class fileService {
  async read(path: string) {
    return '';
  }

  async write(path: string, content: string) {
    return '';
  }
}

export const fileServiceInstance = new fileService();
