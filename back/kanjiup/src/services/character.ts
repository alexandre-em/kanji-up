import { deleteFile, storageUrl, uploadFile } from '../config/aws';
import Character from '../dto/Character';
import InvalidError from '../error/invalid';
import { CharacterModel } from '../models';

export const getOneById = (id: string) => {
  return CharacterModel.findOne({ character_id: id }).exec();
};

export const addOne = async (body: CharacterType): Promise<Partial<CharacterType>> => {
  const character = new Character(body.character, body.meaning, body.onyomi, body.kunyomi, body.image as ImageType, body.strokes);
  const image = body.image as ImageType;

  try {
    const uploadedImage = await uploadFile(`characters/${image.filename}` || '', image.data);
    character.imageUrl = uploadedImage.Location;
  } catch (err) {
    throw err;
  }

  const r: CharacterType = await new Promise((resolve, reject) => {
    CharacterModel.create({ ...body, image: character.imageUrl }, (err, res) => {
      if (err) {
        deleteFile(image.filename || '')
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
};

export const updateOne = (id: string, body: Partial<CharacterType>) => {
  const query: Partial<CharacterType> = {};
  if (body.kunyomi) query['kunyomi'] = body.kunyomi;
  if (body.onyomi) query['onyomi'] = body.onyomi;
  if (body.meaning) query['meaning'] = body.meaning;
  if (body.strokes) query['strokes'] = body.strokes;
  if (body.character) query['character'] = body.character;

  return CharacterModel.findOneAndUpdate({ character_id: id }, query).exec();
};

export const updateOneImage = async (id: string, image: ImageType) => {
  try {
    const uploadedImage = await uploadFile(`characters/${image.filename}`, image.data);

    const updatedDoc = await CharacterModel.findOneAndUpdate({ character_id: id }, { image: uploadedImage }).exec();

    if (updatedDoc?.image) {
      if (typeof updatedDoc.image === 'string' && updatedDoc.image.includes(`${storageUrl}/`)) {
        const parsedFilepath = updatedDoc.image.split(`${storageUrl}/`);
        if (parsedFilepath.length > 1) deleteFile(parsedFilepath[1]);
      }
    }

    return updatedDoc;
  } catch (err) {
    throw err;
  }
};
