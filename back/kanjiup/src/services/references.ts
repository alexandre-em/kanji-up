import { CallbackError } from 'mongoose';
import References from '../dto/References';
import InvalidError from '../error/invalid';
import { ReferenceModel } from '../models';

export const getOneById = (id: string): Promise<ReferenceType> => {
  return ReferenceModel.findOne({ reference_id: id }).exec();
};

export const addOne = async (body: Partial<ReferenceType>): Promise<Partial<ReferenceType>> => {
  const reference = new References(body.grade!, body.kodansha!, body.classic_nelson!);

  const r: ReferenceType = await new Promise((resolve, reject) => {
    ReferenceModel.create(body, (err: CallbackError, res: ReferenceType) => {
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
};
