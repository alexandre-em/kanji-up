import * as FileSystem from 'expo-file-system';

export const fileNames = {
  SELECTED_KANJI: 'selectedKanji',
  USER_SCORES: 'userScores',
};

export const readFile = (name: string) => {
  const fileUri = `${FileSystem.documentDirectory}${name}.json`;
  return FileSystem.readAsStringAsync(fileUri);
};

export const writeFile = (name: string, contents: string) => {
  const fileUri = `${FileSystem.documentDirectory}${name}.json`;
  return FileSystem.writeAsStringAsync(fileUri, contents);
};

