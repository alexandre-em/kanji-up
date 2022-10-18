import React, {useCallback, useEffect, useState} from 'react';
import axios, {AxiosResponse} from 'axios';
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs-core';
import * as tflite from '@tensorflow/tfjs-tflite';

import useIndexedDb from '../useIndexedDb';
import {kanjiPredictionConstants} from './const';
import labels from './labels';
import {Tensor, Tensor3D} from '@tensorflow/tfjs-core';

tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.8/dist/');

const url = 'https://anki-images.s3.eu-west-3.amazonaws.com/models/kanji_model.tflite';

interface usePredictionProps {
  handleError: Function,
};

export default function usePrediction({ handleError }: usePredictionProps) {
  const startDb = useIndexedDb();
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<tflite.TFLiteModel>();

  const downloadThenSave = useCallback(async () => {
    const buffer: AxiosResponse<ArrayBuffer> = await axios.get(url, { responseType: 'arraybuffer'});
    await startDb(buffer.data, 'kanjiPrediction');

    return buffer.data;
  }, []);

  const loadModel = useCallback(async () => {
    if (model) { throw new Error('Model already loaded'); }
    if (!model && loading) { throw new Error('Model is loading...') }

    setLoading(true);
    const storedModels : any = await startDb(null, 'kanjiPrediction');
    const buffer = storedModels['kanjiPrediction'];

    const loadedModel: tflite.TFLiteModel = await tflite.loadTFLiteModel(buffer, { numThreads: navigator.hardwareConcurrency / 2 });
    setModel(loadedModel);
  }, [loading, model]);

  /**
   * @param image {string} - base64 image format
   * @returns predictionResult
   */
  const predict = useCallback(async (image: string) => {
    if (!model && !loading) { throw new Error('Model is not loaded yet'); }
    if (!model && loading) { throw new Error('Model is loading...') }

    try {
      const img: HTMLImageElement = await new Promise((resolve, reject) => {
        const imageData = new Image();
        imageData.onload = function() {
          resolve(imageData);
        };
        imageData.onerror = function (e, s, _, error) {
          reject(error);
        };
        imageData.src = image;
      });

      // image preprocessing
      const {MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT, MIN_CONFIDENCE} = kanjiPredictionConstants;
      const imageTensor: Tensor3D = tf.browser.fromPixels(img, 1);
      const resizedImage: Tensor3D = tf.image.resizeBilinear(imageTensor, [MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT]);
      // prediction of the model on the image
      const prediction: Tensor = model!.predict(tf.expandDims(tf.div(resizedImage, 255), 0)) as Tensor;
      const predictionArray: number[][] = prediction.arraySync() as number[][];

      // result
      const indexes = predictionArray[0]
        .map((v: number, indice: number) => indice)
        .filter((iconfidence: number) => (predictionArray[0][iconfidence] >= MIN_CONFIDENCE));

      return indexes.map((index: number) => ({ prediction: labels[index], confidence: predictionArray[0][index] }));
    } catch (err) {
      if (!handleError) {
        console.error(err);
      } else {
        handleError(err);
      }
    }
  }, [model, loading]);

  useEffect(() => {
    setLoading(false);
  }, [model]);

  return null;
};

