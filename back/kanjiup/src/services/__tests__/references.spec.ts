import * as referenceService from '../references';
import { dbConnect, dbDisconnect } from '../../utils/dbtest.utils';
import ReferenceModel, { ReferenceDocument } from '../../models/References';

describe('referenceService', () => {
  let referenceTest: ReferenceDocument;

  beforeAll(async () => {
    await dbConnect();
    referenceTest = await ReferenceModel.create({ grade: 'test-grade', classic_nelson: 'test-nelson', kodansha: 'test-kodansha' });
  });
  afterAll(async () => await dbDisconnect());

  describe('getOneById', () => {
    it('Should return reference detail', async () => {
      const referenceResponse = await referenceService.getOneById(referenceTest.reference_id);

      expect(referenceResponse?.reference_id).toEqual(referenceTest.reference_id);
      expect(referenceResponse?.grade).toEqual(referenceTest.grade);
      expect(referenceResponse?.classic_nelson).toEqual(referenceTest.classic_nelson);
      expect(referenceResponse?.kodansha).toEqual(referenceTest.kodansha);
    });

    it('Should return null (not found)', async () => {
      const referenceResponse = await referenceService.getOneById('test-reference-id');

      expect(referenceResponse).toBeNull();
    });
  });

  // TODO: Complete test and add case where no image is added + add AWS.S3 mocks
  describe('addOne', () => {
    it('Should create a new reference', async () => {
      const newReferenceDetail = {
        grade: 'new-grade',
        classic_nelson: 'new-nelson',
        kodansha: 'new-kodansha',
      };

      const newReferenceResponse = await referenceService.addOne(newReferenceDetail);

      Object.keys(newReferenceDetail).forEach((key) => {
        expect((newReferenceResponse as any)[key]).toBe((newReferenceDetail as any)[key]);
      });

      const newReference = await ReferenceModel.findOne({ reference_id: newReferenceResponse.id as string }).exec();

      expect(newReference).not.toBeNull();
      expect(newReference.reference_id).toBe(newReferenceResponse.id);
    });
  });
});
