import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import { IOHandler } from '@tensorflow/tfjs-core/dist/io/types';
import { Buffer } from 'buffer';
import axios, { AxiosRequestHeaders } from 'axios';

import { asyncStorageIO } from '../FileSystemIO';
import { kanjiPredictionConstants } from './const';
import labels from './labels';
import { API_BASE_URL } from '../../constants';
import KRJson from './kanji_web_model/model.json';
import KRBin1 from './kanji_web_model/group1-shard1of16.bin';
import KRBin2 from './kanji_web_model/group1-shard2of16.bin';
import KRBin3 from './kanji_web_model/group1-shard3of16.bin';
import KRBin4 from './kanji_web_model/group1-shard4of16.bin';
import KRBin5 from './kanji_web_model/group1-shard5of16.bin';
import KRBin6 from './kanji_web_model/group1-shard6of16.bin';
import KRBin7 from './kanji_web_model/group1-shard7of16.bin';
import KRBin8 from './kanji_web_model/group1-shard8of16.bin';
import KRBin9 from './kanji_web_model/group1-shard9of16.bin';
import KRBin10 from './kanji_web_model/group1-shard10of16.bin';
import KRBin11 from './kanji_web_model/group1-shard11of16.bin';
import KRBin12 from './kanji_web_model/group1-shard12of16.bin';
import KRBin13 from './kanji_web_model/group1-shard13of16.bin';
import KRBin14 from './kanji_web_model/group1-shard14of16.bin';
import KRBin15 from './kanji_web_model/group1-shard15of16.bin';
import KRBin16 from './kanji_web_model/group1-shard16of16.bin';

export default function usePrediction() {
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<tf.GraphModel<tf.io.IOHandler>>();

  const downloadThenSave = useCallback(async (onProgress: (progress: number) => void, onFinishDownload?: () => void, headers?: AxiosRequestHeaders) => {
    await tf.setBackend('cpu');
    await tf.ready();
    const url = (await axios.get(`${API_BASE_URL}/recognition/model?model=${kanjiPredictionConstants.MODEL_KEY_DL}`, { headers })).data.native;
    const loadedModel = await tf.loadGraphModel(url, {
      onProgress,
      requestInit: {},
    });

    if (onFinishDownload) {
      onFinishDownload();
    }

    await loadedModel.save(asyncStorageIO('kanji-prediction') as IOHandler);
  }, []);

  const isBufferStored = React.useMemo(async () => {
    const keys = await AsyncStorage.getAllKeys();
    const keyOccurences = keys.filter((k) => k.includes('kanjiPrediction')).length;

    return keyOccurences === 3;
  }, []);

  const loadModelWeb = useCallback(async () => {
    if (model) {
      return;
    }
    if (!model && loading) {
      throw new Error('Model is still loading...');
    }

    if (await isBufferStored) {
      setLoading(true);
      const asyncStorageKeys = await AsyncStorage.getAllKeys();
      const asyncStorageKeyOccurences = asyncStorageKeys.filter((k) => k.includes('kanjiPrediction')).length;

      if (asyncStorageKeyOccurences !== 3) {
        throw new Error('Unable to find kanjiPrediction model');
      }

      await tf.ready();

      const loadedModel: tf.GraphModel<tf.io.IOHandler> = await tf.loadGraphModel(asyncStorageIO(kanjiPredictionConstants.MODEL_KEY) as IOHandler);
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

    setLoading(true);

    await tf.setBackend('cpu');
    await tf.ready();

    const modelWeights = [KRBin1, KRBin2, KRBin3, KRBin4, KRBin5, KRBin6, KRBin7, KRBin8, KRBin9, KRBin10, KRBin11, KRBin12, KRBin13, KRBin14, KRBin15, KRBin16];

    const modelBundles = bundleResourceIO(KRJson, modelWeights);
    const loadedModel: tf.GraphModel<tf.io.IOHandler> = await tf.loadGraphModel(modelBundles);
    setModel(loadedModel);
    setLoading(false);
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

      const buffer = Buffer.from(image, 'base64');
      // image preprocessing
      const imageTensor = decodeJpeg(buffer, 3);
      const { MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT, MIN_CONFIDENCE } = kanjiPredictionConstants;
      const resizedImage: tf.Tensor3D = tf.image.resizeBilinear(imageTensor, [MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT]).mean(2).expandDims(2); // resized the picture then convert to grayscale by removing '3' then adding '1'
      // prediction of the model on the image
      const prediction: tf.Tensor = model!.predict(tf.expandDims(tf.div(resizedImage, 255), 0)) as tf.Tensor;
      const predictionArray: number[][] = (await prediction.array()) as number[][];

      // result
      const indexes = predictionArray[0].map((v: number, indice: number) => indice).filter((iconfidence: number) => predictionArray[0][iconfidence] >= MIN_CONFIDENCE);

      return indexes.map((index: number) => ({
        prediction: labels[index],
        score: predictionArray[0][index],
      }));
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
