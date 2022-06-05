/* eslint-disable @typescript-eslint/no-var-requires */
import { Tensor } from "@tensorflow/tfjs-node";
import { TFSavedModel } from "@tensorflow/tfjs-node/dist/saved_model";
import { uploadFile } from "../config/aws";
import { RecognitionModel } from "../models";
import { label } from "../utils";

const tfjs = require('@tensorflow/tfjs-node');
const [modelInputHeight, modelInputWidth] = [64, 64];

export const predictKanji = (image: ImageType, loadedModel: TFSavedModel) => {
	const view: Uint8Array = new Uint8Array(image.data);
	const tensorImage = tfjs.node.decodeImage(view, 1);
	const resizedImage = tfjs.image.resizeBilinear(tensorImage, [modelInputHeight, modelInputWidth]);
	const prediction = loadedModel.predict(tfjs.expandDims(tfjs.div(resizedImage, 255), 0)) as Tensor;
	const predictionArray: number[][] = prediction.arraySync() as number [][];
	const indexes = predictionArray[0]
		.map((v: number, indice: number) => indice)
		.filter((iconfidence: number) => (predictionArray[0][iconfidence] >= 0.005));

	return indexes.map((index: number) => ({ prediction: label[index], confidence: predictionArray[0][index] }));
}

export const addOne = async (kanji: string, image: ImageType, predictions: PredictionResultType[]) => {
	try {
		const uploadedImage: AWS.S3.ManagedUpload.SendData = await uploadFile(`uploads/${image.filename}`, image.data) as AWS.S3.ManagedUpload.SendData;

		return RecognitionModel.create({ image: uploadedImage.Location, kanji, predictions });
	} catch (err) {
		throw err;
	}
}

export const updateOne = (recognition_id: string, updatedData: Partial<RecognitionType>) => {
	return RecognitionModel.findOneAndUpdate({ recognition_id }, updatedData);
}
