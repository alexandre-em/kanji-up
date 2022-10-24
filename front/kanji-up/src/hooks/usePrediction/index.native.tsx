import React, {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import {IOHandler} from '@tensorflow/tfjs-core/dist/io/types';
import { Buffer } from 'buffer';

import { asyncStorageIO } from '../FileSystemIO';
import {kanjiPredictionConstants} from './const';
import labels from './labels';

export default function usePrediction() {
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<tf.GraphModel<tf.io.IOHandler>>();

  const downloadThenSave = useCallback(async (onProgress: (progress: number) => void) => {
    console.warn('Downloading model...')
    await tf.ready();
    const model = await tf.loadGraphModel(url, { onProgress });
    await model.save(asyncStorageIO('kanjiPrediction') as IOHandler);
  }, []);

  const isBufferStored = React.useMemo(async () => {
    const keys = await AsyncStorage.getAllKeys();
    const keyOccurences = keys.filter((k) => k.includes('kanjiPrediction')).length;

    return keyOccurences === 3;
  }, []); 

  const loadModel = useCallback(async () => {
    console.log('call loadModel function')
    if (model) { return; }
    if (!model && loading) { throw new Error('Model is still loading...'); }

    if (await isBufferStored) {
      setLoading(true);
      const asyncStorageKeys = await AsyncStorage.getAllKeys();
      const asyncStorageKeyOccurences = asyncStorageKeys.filter((k) => k.includes('kanjiPrediction')).length;

      if (asyncStorageKeyOccurences !== 3) {
        throw new Error('Unable to find kanjiPrediction model');
      }

      await tf.ready();

      console.log('model is loading');
      const loadedModel: tf.GraphModel<tf.io.IOHandler> = await tf.loadGraphModel(asyncStorageIO(kanjiPredictionConstants.MODEL_KEY) as IOHandler);
      console.log('model is loaded');
      setModel(loadedModel);
      setLoading(false);
    } else { throw new Error('Model is not stored'); }
  }, [loading, model]);

  /**
   * @param image {string} - base64 image format
   * @returns predictionResult
   */
  const predict = useCallback(async (image: string) => {
    if (!model && !loading) { throw new Error('Model is not loaded yet'); }
    if (!model && loading) { throw new Error('Model is loading...') }

    try {
      const buffer = Buffer.from(image, 'base64');
      // image preprocessing
      const imageTensor = decodeJpeg(buffer, 3);
      const {MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT, MIN_CONFIDENCE} = kanjiPredictionConstants;
      const resizedImage: tf.Tensor3D = tf.image
        .resizeBilinear(imageTensor, [MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT])
        .mean(2)
        .expandDims(2); // resized the picture then convert to grayscale by removing '3' then adding '1'
      // prediction of the model on the image
      const prediction: tf.Tensor = model!.predict(tf.expandDims(tf.div(resizedImage, 255), 0)) as tf.Tensor;
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

