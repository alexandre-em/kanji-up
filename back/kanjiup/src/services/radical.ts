import InvalidError from '../error/invalid';
import Radical from '../dto/Radical';
import { RadicalModel } from '../models';
import { deleteFile, storageUrl, uploadFile } from '../config/aws';

export const getOneById = (id: string) => {
  return RadicalModel.findOne({ radical_id: id }).exec();
};

export const addOne = async (body: RadicalType): Promise<Partial<RadicalType>> => {
  const radical = new Radical(body.character, body.strokes, body.image as ImageType, body.name, body.meaning);
  // const image = body.image as ImageType;

  // try {
  //   const uploadedImage: AWS.S3.ManagedUpload.SendData = (await uploadFile(`radicals/${image.filename}`, image.data)) as AWS.S3.ManagedUpload.SendData;
  //   radical.imageUrl = uploadedImage.Location;
  // } catch (err) {
  //   throw err;
  // }

  const r: RadicalType = await new Promise((resolve, reject) => {
    RadicalModel.create({ ...body, image: radical.imageUrl }, (err, res) => {
      if (err) {
        // if (image.filename)
        //   deleteFile(image.filename as string)
        //     .then(() => reject(new InvalidError(err.message)))
        //     .catch((e) => reject(e));
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  if (r instanceof InvalidError) {
    // TODO: log error with stack
    throw r;
  }

  radical.id = r.radical_id;

  return radical.toDTO();
};

export const updateOne = (id: string, body: Partial<RadicalType>) => {
  const query: Partial<RadicalType> = {};
  if (body.name) query.name = body.name;
  if (body.meaning) query['meaning'] = body.meaning;
  if (body.strokes) query['strokes'] = body.strokes;
  if (body.character) query['character'] = body.character;

  return RadicalModel.findOneAndUpdate({ radical_id: id }, query).exec();
};

export const updateOneImage = async (id: string, image: ImageType) => {
  try {
    const uploadedImage = await uploadFile(`radicals/${image.filename}`, image.data);

    const updatedDoc = await RadicalModel.findOneAndUpdate({ radical_id: id }, { image: uploadedImage }).exec();

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
