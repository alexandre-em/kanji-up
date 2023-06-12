import React, { useCallback, useEffect, useState } from 'react';
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs-core';
import * as tflite from '@tensorflow/tfjs-tflite';

import useIndexedDb from '../useIndexedDb';
import { kanjiPredictionConstants } from './const';
import labels from './labels';
import { API_BASE_URL } from '../../constants';

tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.8/dist/');

export default function usePrediction() {
  const startDb = useIndexedDb();
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<tflite.TFLiteModel>();

  const downloadThenSave = useCallback(async (onProgress: (progress: number) => void, onFinishDownload?: () => void, headers?: AxiosRequestHeaders) => {
    const dlUri = `${API_BASE_URL}/recognition/model?model=${kanjiPredictionConstants.MODEL_KEY_DL}`;
    const modelUrl = (await axios.get(dlUri, { headers })).data.web;
    const buffer: AxiosResponse<ArrayBuffer> = await axios.get(modelUrl, { responseType: 'arraybuffer', onDownloadProgress: onProgress });
    if (onFinishDownload) {
      onFinishDownload();
    }

    await startDb(buffer.data, 'kanjiPrediction');
    localStorage.setItem('kanjiPrediction', 'true');
  }, []);

  const isBufferStored = React.useMemo(async () => JSON.parse(localStorage.getItem('kanjiPrediction') || 'false'), []);

  const loadModelWeb = useCallback(async () => {
    if (model) {
      return;
    }
    if (!model && loading) {
      throw new Error('Model is still loading...');
    }

    const options = { numThreads: navigator.hardwareConcurrency / 2 };

    if (await isBufferStored) {
      setLoading(true);
      const storedModels: any = await startDb(null, 'kanjiPrediction');
      const buffer = storedModels.kanjiPrediction;

      const loadedModel: tflite.TFLiteModel = await tflite.loadTFLiteModel(buffer, options);
      setModel(loadedModel);
      setLoading(false);
    } else {
      throw new Error('Model is not stored');
    }
  }, [loading, model]);

  const loadModelLocal = useCallback(async () => {
    if (model) {
      return;
    }
    if (!model && loading) {
      throw new Error('Model is still loading...');
    }

    const options = { numThreads: navigator.hardwareConcurrency / 2 };

    if (!loading) {
      setLoading(true);
      const modelPath = require('./kanji_model.tflite');
      const loadedModel: tflite.TFLiteModel = await tflite.loadTFLiteModel(modelPath, options);
      setModel(loadedModel);
      setLoading(false);
    }
  }, [loading, model]);

  const loadModel = useCallback(async (mode = 'local') => {
    switch (mode) {
      case 'web':
        await loadModelWeb();
        break;
      default:
        await loadModelLocal();
    }
  }, []);

  /**
   * @param image {string} - base64 image format
   * @returns predictionResult
   */
  const predict = useCallback(
    async (image: string) => {
      if (!model && !loading) {
        throw new Error('Model is not loaded yet');
      }
      if (!model && loading) {
        throw new Error('Model is loading...');
      }

      const img: HTMLImageElement = await new Promise((resolve, reject) => {
        const imageData = new Image();
        imageData.onload = () => {
          resolve(imageData);
        };
        imageData.onerror = (e, s, _, error) => {
          reject(error);
        };
        imageData.src = image;
      });

      // image preprocessing
      const { MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT, MIN_CONFIDENCE } = kanjiPredictionConstants;
      const imageTensor: tf.Tensor3D = tf.browser.fromPixels(img, 1);
      const resizedImage: tf.Tensor3D = tf.image.resizeBilinear(imageTensor, [MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT]);
      // prediction of the model on the image
      const prediction: tf.Tensor = model!.predict(tf.expandDims(tf.div(resizedImage, 255), 0)) as tf.Tensor;
      const predictionArray: number[][] = prediction.arraySync() as number[][];

      // result
      const indexes = predictionArray[0].map((v: number, indice: number) => indice).filter((iconfidence: number) => predictionArray[0][iconfidence] >= MIN_CONFIDENCE);

      return indexes.map((index: number) => ({ prediction: labels[index], confidence: predictionArray[0][index] }));
    },
    [model, loading]
  );

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
}
