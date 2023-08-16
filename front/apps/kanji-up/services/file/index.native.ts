import { RefObject } from 'react';
import core from 'kanji-app-core';
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

export const uploadImage = async (canvasRef: RefObject<any>, kanji: string) => {
  if (!canvasRef && !canvasRef.current) {
    throw new Error('canvasRef is not ready');
  }

  const imageBase64: string = await canvasRef.current.getUri();
  const imageBase64Code = imageBase64.split('data:image/jpeg;base64,')[1];

  const filename = `${FileSystem.documentDirectory}${Date.now().toString()}.jpg`;
  await FileSystem.writeAsStringAsync(filename, imageBase64Code, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const recognition = await core.recognitionService?.postNative(kanji, filename);

  await FileSystem.deleteAsync(filename);

  return recognition;
};
