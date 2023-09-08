import axios, { AxiosResponse } from 'axios';
import * as tf from '@tensorflow/tfjs-core';
import * as tflite from '@tensorflow/tfjs-tflite';

import labels from './labels';
import { kanjiPredictionConstants } from '../constants';
import Model, { ModelMode, ModelObject } from '../Model';

export default class RecognitionModel extends Model {
  private _model;
  constructor(mode: ModelMode, model: ModelObject) {
    super(mode, model);
    this.load();
  }
  public override async isModelStored() {
    return JSON.parse(localStorage.getItem(kanjiPredictionConstants.MODEL_KEY) || 'false');
  }

  public override download(saveCallback?: (m: any) => void, onProgress?: (p: any) => void) {
    // return new Promise((resolve, rej) => {
    //   axios
    //     .get(super.modelObject.DL!.url as string, {
    //       responseType: 'arraybuffer',
    //       onDownloadProgress: onProgress,
    //     })
    //     .then(({ data }: AxiosResponse<ArrayBuffer>) => {
    //       if (saveCallback) saveCallback(data);
    //       tflite.loadTFLiteModel(data).then((m) => {
    //         this._model = m;
    //         resolve(m);
    //         localStorage.setItem(kanjiPredictionConstants.MODEL_KEY, 'true');
    //       });
    //     })
    //     .catch(rej);
    // });
    return new Promise((resolve) => {
      resolve({});
    });
  }

  private loadLocalModel() {
    // eslint-disable-next-line
    const modelPath = require('./kanji_model.tflite');

    return tflite.loadTFLiteModel(modelPath);
  }

  private loadDLModel() {
    // if (!this.isModelStored()) throw new Error('Please save the model before loading it');

    // const recognitionBuffer = super.modelObject.DL?.storedModel[kanjiPredictionConstants.MODEL_KEY];

    // return tflite.loadTFLiteModel(recognitionBuffer as ArrayBuffer);
    return new Promise((res) => {
      res({} as any);
    });
  }

  public override load() {
    const model = (super.mode === ModelMode.DL ? this.loadDLModel : this.loadLocalModel)();

    model.then((m) => {
      this._model = m;
    });

    return model;
  }

  public override async predict(image: string) {
    // if (!this._model) {
    //   throw new Error('Model is not loaded yet');
    // }
    // if (!image) {
    //   throw new Error('No image loaded');
    // }

    // const img: HTMLImageElement = await new Promise((resolve, reject) => {
    //   const imageData = new Image();
    //   imageData.onload = () => {
    //     resolve(imageData);
    //   };
    //   imageData.onerror = (e, s, _, error) => {
    //     reject(error);
    //   };
    //   imageData.src = image;
    // });

    // // image preprocessing
    // const { MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT, MIN_CONFIDENCE } = kanjiPredictionConstants;
    // const imageTensor: tf.Tensor3D = tf.browser.fromPixels(img, 1);
    // const resizedImage: tf.Tensor3D = tf.image.resizeBilinear(imageTensor, [MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT]);
    // // prediction of the model on the image
    // const prediction: tf.Tensor = this._model!.predict(tf.expandDims(tf.div(resizedImage, 255), 0)) as tf.Tensor;
    // const predictionArray: number[][] = prediction.arraySync() as number[][];

    // // result
    // const indexes = predictionArray[0]
    //   .map((v: number, indice: number) => indice)
    //   .filter((iconfidence: number) => predictionArray[0][iconfidence] >= MIN_CONFIDENCE);

    // return indexes.map((index: number) => ({ prediction: labels[index], score: predictionArray[0][index] }));
    return [];
  }
}
