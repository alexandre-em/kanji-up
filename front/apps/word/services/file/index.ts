import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RefObject } from 'react';

import core from 'kanji-app-core';
import { PredictionType } from 'kanji-app-types';

export const fileNames = {
  SELECTED_WORD: 'selectedWord',
  USER_SCORES: 'userScores',
  USER_SETTINGS: 'userSettings',
};

export const readFile = (name: string): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const contents = localStorage.getItem(name);
      if (!contents) {
        reject(new Error(`Data with key ${name} not found`));
      }
      resolve(contents as string);
    } catch (err) {
      reject(err);
    }
  });

export const writeFile = (name: string, contents: string) =>
  new Promise((resolve, reject) => {
    try {
      localStorage.setItem(name, contents);
      resolve(undefined);
    } catch (err) {
      reject(err);
    }
  });

export const uploadImage = async (canvasRef: RefObject<any>, kanji: string, options?: AxiosRequestConfig) => {
  if (!canvasRef || !canvasRef.current) {
    throw new Error('canvasRef is not ready');
  }
  return new Promise((resolve, reject) => {
    canvasRef.current.toBlob((blob: Blob) => {
      core.recognitionService
        ?.post(kanji, blob, options)
        .then((res: AxiosResponse<PredictionType[]>) => {
          resolve(res.data);
        })
        .catch(reject);
    });
  });
};
