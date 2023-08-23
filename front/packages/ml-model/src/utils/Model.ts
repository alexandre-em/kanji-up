import { TFLiteModel } from '@tensorflow/tfjs-tflite';
import * as tf from '@tensorflow/tfjs';
import { PredictionType } from 'kanji-app-types';

export enum ModelMode {
  DL = 'DL',
  LOCAL = 'LOCAL',
}

export type ModelObject = {
  DL?: {
    url: string | string[];
    key: string;
    storedModel: { [key: string]: ArrayBuffer };
  };
  LOCAL?: {};
};

export default abstract class Model {
  protected mode: ModelMode;
  protected modelObject: ModelObject;

  constructor(mode: ModelMode, model: ModelObject) {
    this.mode = mode;
    this.modelObject = model;
    if (mode === ModelMode.DL) {
      if (!model.DL?.url || !model.DL?.key) throw new Error('Mode ' + mode + ' selected but model contents is ' + model.LOCAL);
    }
  }
  /**
   * @returns boolean if model is stored or not
   */
  public abstract isModelStored(): boolean | Promise<boolean>;

  /**
   * @param saveCallback {Function} callback to save the buffer model
   * @param onProgress {Function} callback to read the download progression
   * @returns tf loaded model
   */
  public abstract download(
    saveCallback: (m: Promise<any>) => void,
    onProgress?: (p: any) => void
  ): Promise<TFLiteModel | tf.GraphModel>;

  /**
   * @param
   * @returns tf loaded model
   */
  public abstract load(): Promise<TFLiteModel | tf.GraphModel>;

  /**
   * @param image {string} - base64 image format
   * @returns predictionResult
   */
  public abstract predict(image: string): Promise<PredictionType[]>;
}
