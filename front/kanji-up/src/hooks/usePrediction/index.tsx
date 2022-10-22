import React, {useCallback, useEffect, useState} from 'react';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs-core';
import * as tflite from '@tensorflow/tfjs-tflite';
import {Tensor, Tensor3D} from '@tensorflow/tfjs-core';

import useIndexedDb from '../useIndexedDb';
import {kanjiPredictionConstants} from './const';
import labels from './labels';

tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.8/dist/');

const url = 'https://anki-images.s3.eu-west-3.amazonaws.com/models/kanji_model.tflite';

export default function usePrediction() {
  const startDb = useIndexedDb();
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<tflite.TFLiteModel>();

  const downloadThenSave = useCallback(async (options: AxiosRequestConfig) => {
    const buffer: AxiosResponse<ArrayBuffer> = await axios.get(url, options);
    await startDb(buffer.data, 'kanjiPrediction');
    localStorage.setItem('kanjiPrediction', 'true');

    return buffer.data;
  }, []);

  const isBufferStored = React.useMemo(() => (
    JSON.parse(localStorage.getItem('kanjiPrediction') || 'false')
  ), []); 

  const loadModel = useCallback(async (customBuffer=null) => {
    console.log('call loadModel function')
    if (model) { return; }
    if (!model && loading) { throw new Error('Model is still loading...'); }

    const options = { numThreads: navigator.hardwareConcurrency / 2 };

    if (!customBuffer && isBufferStored) {
      setLoading(true);
      const storedModels : any = await startDb(null, 'kanjiPrediction');
      const buffer = storedModels['kanjiPrediction'];

      console.log('model is loading');
      const loadedModel: tflite.TFLiteModel = await tflite.loadTFLiteModel(buffer, options);
      console.log('model is loaded');
      setModel(loadedModel);
      setLoading(false);
    }

    if (customBuffer) {
      console.log('model is loading');
      const loadedModel: tflite.TFLiteModel = await tflite.loadTFLiteModel(customBuffer, options);
      console.log('custom model is loaded');
      setModel(loadedModel);
      setLoading(false);
    }
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
      throw err;
    }
  }, [model, loading]);

  console.log(model);

  useEffect(() => {
    if (model) {
      setLoading(false);
    }
  }, [model]);

  return {
    model,
    isBufferStored,
    loadModel,
    downloadThenSave,
    predict,
  };
};

