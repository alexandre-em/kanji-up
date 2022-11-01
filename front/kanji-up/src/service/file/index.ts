import {RefObject} from "react";
import {recognitionService} from "..";

export const fileNames = {
  SELECTED_KANJI: 'selectedKanji',
  USER_SCORES: 'userScores',
};

export const readFile = (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try{
      const contents = localStorage.getItem(name);
      if (!contents) { reject(new Error(`Data with key ${name} not found`)); }
      resolve(contents as string);
    } catch (err) {
      reject(err);
    }
  });
};

export const writeFile = (name: string, contents: string) => {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(name, contents);
      resolve(undefined);
    } catch (err) {
      reject(err);
    }
  });
};

export const uploadImage = async (canvasRef: RefObject<any>, kanji: string, prediction: Array<PredictionType>) => {
  if (!canvasRef && !canvasRef.current) { throw new Error('canvasRef is not ready') }

  return new Promise((resolve, reject) => {
    canvasRef.current.toBlob((blob: Blob) => {
      recognitionService.postRecognition(kanji, prediction, blob)
        .then(resolve)
        .catch(reject);
    });
  });
}

