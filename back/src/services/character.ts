import AWS from 'aws-sdk';

import { deleteFile, uploadFile } from "../config/aws";
import Character from "../dto/Character";
import InvalidError from "../error/invalid";
import { CharacterModel } from "../models";

export const getOneById = (id: string): Promise<CharacterType> => {
  return CharacterModel.findOne({ character_id: id }).exec();
}

export const addOne = async (body: Partial<CharacterType>): Promise<Partial<CharacterType>> => {
  const character = new Character(body.character, body.meaning, body.onyomi, body.kunyomi, body.image, body.strokes);
  const image = body.image as ImageType;

  try {
    const uploadedImage: AWS.S3.ManagedUpload.SendData = await uploadFile(image.filename, image.data) as AWS.S3.ManagedUpload.SendData;
    character.imageUrl = uploadedImage.Location;
  } catch (err) {
    throw err;
  }

  const r: CharacterType = await new Promise((resolve, reject) => {
    CharacterModel.create(body, (err, res) => {
      if (err) {
        deleteFile(image.filename)
          .then(() => reject(new InvalidError(err.message)))
          .catch((e) => reject(e));
      } else {
        resolve(res);
      }
    });
  });

  if (r instanceof InvalidError) {
    // TODO: log with stack
    throw r;
  }

  character.id = r.character_id;

  return character.toDTO();
}

export const updateOne = (id: string, body: Partial<CharacterType>): Promise<CharacterType> => {
  const query: Partial<CharacterType> = {};
  if (body.kunyomi) query['kunyomi'] = body.kunyomi;
  if (body.onyomi) query['onyomi'] = body.onyomi;
  if (body.meaning) query['meaning'] = body.meaning;
  if (body.strokes) query['strokes'] = body.strokes;
  if (body.character) query['character'] = body.character;

  return CharacterModel.findOneAndUpdate({ character_id: id }, query).exec();
}

export const updateOneImage = async (id: string, image: ImageType): Promise<CharacterType> => {
  try {
    const uploadedImage: AWS.S3.ManagedUpload.SendData = await uploadFile(image.filename, image.data) as AWS.S3.ManagedUpload.SendData;
    const imageUrl = uploadedImage.Location;

    return CharacterModel.findOneAndUpdate({ character_id: id }, { image: imageUrl }).exec();
  } catch (err) {
    throw err;
  }
}
