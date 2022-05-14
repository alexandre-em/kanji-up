import References from "../dto/References";
import InvalidError from "../error/invalid";
import { ReferenceModel } from "../models";
import { ReferenceType } from "../utils";

export const getOneById = (id: string): Promise<ReferenceType> => {
	return ReferenceModel.findOne({ reference_id: id }).exec();
}

export const addOne = async (body): Promise<Partial<ReferenceType>> => {
	const reference = new References(body.grade, body.kodansha, body.classicNelson);

	const r: ReferenceType = await new Promise((resolve, reject) => {
		ReferenceModel.create(body, (err, res) => {
			if (err) {
				reject(new InvalidError(err.message));
			} else {
				resolve(res);
			}
		});
	});

	if (r instanceof InvalidError) {
		// TODO: log with stack
		throw r;
	}

	return reference.toDTO(r.reference_id);
}
