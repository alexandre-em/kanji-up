/* eslint-disable @typescript-eslint/no-var-requires */
import { uploadFile } from '../config/aws';
import { RecognitionModel } from '../models';

export const getAll = async (page: number, limit: number, query?: string) => {
  return RecognitionModel.paginate(query === '' || !query ? { is_valid: null } : { kanji: query, is_valid: null }, { limit, page, select: '-_id, -__v' });
};

export const addOne = async (kanji: string, image: ImageType, predictions: PredictionResultType[]) => {
  try {
    const uploadedImage: AWS.S3.ManagedUpload.SendData = (await uploadFile(`uploads/${kanji}/${image.filename}`, image.data)) as AWS.S3.ManagedUpload.SendData;

    return RecognitionModel.create({ image: uploadedImage.Location, kanji, predictions });
  } catch (err) {
    throw err;
  }
};

export const addOneData = async (kanji: string, image: ImageType) => {
  try {
    return (await uploadFile(`uploads/data/${kanji}/${image.filename}`, image.data)) as AWS.S3.ManagedUpload.SendData;
  } catch (err) {
    throw err;
  }
};

export const updateOne = (recognition_id: string, updatedData: Partial<RecognitionType>) =>
  RecognitionModel.findOneAndUpdate({ recognition_id }, updatedData).select('-_id -__v -predictions._id').exec();
