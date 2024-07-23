/* eslint-disable @typescript-eslint/no-var-requires */
import { uploadFile } from '../config/aws';
import { RecognitionModel } from '../models';

export const getAll = async (page: number, limit: number, query?: string) => {
  return RecognitionModel.paginate(query === '' || !query ? { is_valid: null } : { kanji: query, is_valid: null }, { limit, page, select: '-_id, -__v' });
};

export const addOne = async (kanji: string, image: ImageType, predictions: PredictionResultType[]) => {
  try {
    const uploadedImage = await uploadFile(`uploads/${kanji}/${image.filename}`, image.data);

    return RecognitionModel.create({ image: uploadedImage, kanji, predictions });
  } catch (err) {
    throw err;
  }
};

export const addOneData = (kanji: string, image: ImageType) => {
  try {
    return uploadFile(`/recognition/uploads/data/${kanji}/${image.filename}`, image.data);
  } catch (err) {
    throw err;
  }
};

export const updateOne = (recognition_id: string, updatedData: Partial<RecognitionType>) =>
  RecognitionModel.findOneAndUpdate({ recognition_id }, updatedData).select('-_id -__v -predictions._id').exec();
