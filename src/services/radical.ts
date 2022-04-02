import InvalidError from '../error/invalid';
import Radical from '../dto/Radical';
import { RadicalModel } from '../models';
import { RadicalType } from '../utils';

export const getOneById = (id: string) => {
	return RadicalModel.findOne({ radical_id: id }).exec();
}

export const addOne = async (body) => {
	const radical = new Radical(body.character, body.stroke, body.image, body.name, body.meaning);
	
	const r: RadicalType = await new Promise((resolve, reject) => {
		RadicalModel.create(body, (err, res) => {
			if (err) {
				reject(new InvalidError(err.message));
			} else {
				resolve(res);
			}
		});
	});
	
	if(r instanceof InvalidError) {
		// TODO: log error with stack
		throw r;
	}

	radical.id = r.radical_id;
	
	return radical.toDTO();
}
