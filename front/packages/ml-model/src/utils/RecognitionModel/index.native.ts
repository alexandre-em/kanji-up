import AsyncStorage from '@react-native-async-storage/async-storage';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import { IOHandler } from '@tensorflow/tfjs-core/dist/io/types';
import { Buffer } from 'buffer';

import labels from './labels';
import { asyncStorageIO } from '../FileSystemIO';
import Model, { ModelMode, ModelObject } from '../Model';
import { kanjiPredictionConstants } from '../constants';

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

export default class RecognitionModel extends Model {
  private _model;

  constructor(mode: ModelMode, model: ModelObject) {
    super(mode, model);
    this.load();
  }

  public override async download(saveCallback?: () => void, onProgress?: (n: number) => void) {
    await tf.setBackend('cpu');
    await tf.ready();
    const loadedModel = await tf.loadGraphModel(super.modelObject.DL!.url as string, {
      onProgress,
      requestInit: {},
    });

    this._model = loadedModel;

    await loadedModel.save(asyncStorageIO(kanjiPredictionConstants.MODEL_KEY) as IOHandler);

    return loadedModel;
  }

  public override async isModelStored() {
    const keys = await AsyncStorage.getAllKeys();
    const keyOccurences = keys.filter((k) => k.includes('kanjiPrediction')).length;

    return keyOccurences === 3;
  }

  private async loadDLModel() {
    const asyncStorageKeys = await AsyncStorage.getAllKeys();
    const asyncStorageKeyOccurences = asyncStorageKeys.filter((k) => k.includes(kanjiPredictionConstants.MODEL_KEY)).length;

    if (asyncStorageKeyOccurences !== 3) {
      throw new Error('Unable to find kanjiPrediction model');
    }

    await tf.ready();

    return tf.loadGraphModel(asyncStorageIO(kanjiPredictionConstants.MODEL_KEY) as IOHandler);
  }

  private async loadLocalModel() {
    await tf.setBackend('cpu');
    await tf.ready();

    const modelWeights = [
      KRBin1,
      KRBin2,
      KRBin3,
      KRBin4,
      KRBin5,
      KRBin6,
      KRBin7,
      KRBin8,
      KRBin9,
      KRBin10,
      KRBin11,
      KRBin12,
      KRBin13,
      KRBin14,
      KRBin15,
      KRBin16,
    ];

    const modelBundles = bundleResourceIO(KRJson, modelWeights);
    return tf.loadGraphModel(modelBundles);
  }

  public override async load() {
    if (!(await this.isModelStored()) && super.mode === ModelMode.DL) throw new Error('Please save the model before loading it');

    const model = (super.mode === ModelMode.DL ? this.loadDLModel : this.loadLocalModel)();

    return model.then((m) => (this._model = m));
  }

  public override async predict(image: string) {
    console.warn('to buffer');
    const buffer = Buffer.from(image, 'base64');
    // image preprocessing
    console.warn('decode jpeg');
    const imageTensor = decodeJpeg(buffer, 3);
    const { MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT, MIN_CONFIDENCE } = kanjiPredictionConstants;
    console.warn('resize image');
    // resize the picture then convert it to grayscale by removing '3' then adding '1'
    const resizedImage: tf.Tensor3D = tf.image
      .resizeBilinear(imageTensor, [MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT])
      .mean(2)
      .expandDims(2);
    // prediction of the model on the image
    console.warn('predict');
    const prediction: tf.Tensor = this._model!.predict(tf.expandDims(tf.div(resizedImage, 255), 0)) as tf.Tensor;
    const predictionArray: number[][] = (await prediction.array()) as number[][];

    console.warn('result');
    // result
    const indexes = predictionArray[0]
      .map((v: number, indice: number) => indice)
      .filter((iconfidence: number) => predictionArray[0][iconfidence] >= MIN_CONFIDENCE);

    return indexes.map((index: number) => ({
      prediction: labels[index],
      score: predictionArray[0][index],
    }));
  }
}
