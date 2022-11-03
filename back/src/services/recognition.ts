/* eslint-disable @typescript-eslint/no-var-requires */
import { uploadFile } from "../config/aws";
import { RecognitionModel } from "../models";

export const getAll = async (page: number, limit: number, query?: string) => {
  return RecognitionModel
    .paginate(query === '' || !query ? {} : { kanji: query }, { limit, page, select: '-_id, -__v' });
}

export const addOne = async (kanji: string, image: ImageType, predictions: PredictionResultType[]) => {
	try {
		const uploadedImage: AWS.S3.ManagedUpload.SendData = await uploadFile(`uploads/${kanji}/${image.filename}`, image.data) as AWS.S3.ManagedUpload.SendData;

		return RecognitionModel.create({ image: uploadedImage.Location, kanji, predictions });
	} catch (err) {
		throw err;
	}
}

export const updateOne = (recognition_id: string, updatedData: Partial<RecognitionType>) => (
	RecognitionModel
		.findOneAndUpdate({ recognition_id }, updatedData)
		.select('-_id -__v -predictions._id')
		.exec()
)
