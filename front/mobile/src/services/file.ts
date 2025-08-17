import AsyncStorage from '@react-native-async-storage/async-storage';

export const fileNames = {
  SELECTED_KANJI: 'selectedKanji',
  SELECTED_WORD: 'selectedWord',
  USER_SCORES: 'userScores',
};

class fileService {
  async read(path: string) {
    const textContent = await AsyncStorage.getItem(path);

    if (!textContent) return null;

    return JSON.parse(textContent);
  }

  async write(path: string, content: any) {
    return await AsyncStorage.setItem(path, JSON.stringify(content));
  }
}

export const fileServiceInstance = new fileService();
