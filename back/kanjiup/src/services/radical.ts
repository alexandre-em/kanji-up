import InvalidError from '../error/invalid';
import Radical from '../dto/Radical';
import { RadicalModel } from '../models';
import { deleteFile, uploadFile } from '../config/aws';

export const getOneById = (id: string) => {
	return RadicalModel.findOne({ radical_id: id }).exec();
}

export const addOne = async (body: RadicalType): Promise<Partial<RadicalType>> => {
	const radical = new Radical(body.character, body.strokes, body.image as ImageType, body.name, body.meaning);
	const image = body.image as ImageType;

	try {
		const uploadedImage: AWS.S3.ManagedUpload.SendData = await uploadFile(`radicals/${image.filename}`, image.data) as AWS.S3.ManagedUpload.SendData;
		radical.imageUrl = uploadedImage.Location;
	} catch (err) {
		throw err;
	}

	const r: RadicalType = await new Promise((resolve, reject) => {
		RadicalModel.create({ ...body, image: radical.imageUrl }, (err, res) => {
			if (err) {
				if (image.filename)
					deleteFile((image.filename) as string)
						.then(() => reject(new InvalidError(err.message)))
						.catch((e) => reject(e));
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
}
