import * as radicalService from '../radical';
import { dbConnect, dbDisconnect } from '../../utils/dbtest.utils';
import RadicalModel, { RadicalDocument } from '../../models/Radical';

describe('radicalService', () => {
  let radicalTest: RadicalDocument;

  beforeAll(async () => {
    await dbConnect();
    radicalTest = await RadicalModel.create({ character: '心', name: { hiragana: 'こころ', romaji: 'kokoro' }, strokes: 13, meaning: ['heart', 'mind', 'spirit'] });
  });
  afterAll(async () => await dbDisconnect());

  describe('getOneById', () => {
    it('Should return radical detail', async () => {
      const radicalResponse = await radicalService.getOneById(radicalTest.radical_id);

      expect(radicalResponse?.radical_id).toEqual(radicalTest.radical_id);
      expect(radicalResponse?.character).toEqual(radicalTest.character);
      expect(radicalResponse?.strokes).toEqual(radicalTest.strokes);
      expect(radicalResponse?.meaning).toEqual(radicalTest.meaning);
    });

    it('Should return null (not found)', async () => {
      const radicalResponse = await radicalService.getOneById('test-radical-id');

      expect(radicalResponse).toBeNull();
    });
  });

  // TODO: Complete test and add case where no image is added + add AWS.S3 mocks
  describe('addOne', () => {
    console.log('addOne');
  });
});
