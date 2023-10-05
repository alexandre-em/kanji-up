import * as characterService from '../character';
import { dbConnect, dbDisconnect } from '../../utils/dbtest.utils';
import CharacterModel, { CharacterDocument } from '../../models/Character';

describe('characterService', () => {
  let characterTest: CharacterDocument;

  beforeAll(async () => {
    await dbConnect();
    characterTest = await CharacterModel.create({ character: '試', strokes: 13, meaning: ['test', 'try', 'attempt', 'experiment', 'ordeal'], onyomi: ['シ'], kunyomi: ['こころ.みる', 'ため.す'] });
  });
  afterAll(async () => await dbDisconnect());

  describe('getOneById', () => {
    it('Should return character detail', async () => {
      const characterResponse = await characterService.getOneById(characterTest.character_id);

      expect(characterResponse?.character_id).toEqual(characterTest.character_id);
      expect(characterResponse?.character).toEqual(characterTest.character);
      expect(characterResponse?.strokes).toEqual(characterTest.strokes);
      expect(characterResponse?.meaning).toEqual(characterTest.meaning);
      expect(characterResponse?.onyomi).toEqual(characterTest.onyomi);
      expect(characterResponse?.kunyomi).toEqual(characterTest.kunyomi);
    });

    it('Should return null (not found)', async () => {
      const characterResponse = await characterService.getOneById('test-character-id');

      expect(characterResponse).toBeNull();
    });
  });

  // TODO: Complete test and add case where no image is added + add AWS.S3 mocks
  describe('addOne', () => {
    console.log('addOne');
  });

  describe('updateOne', () => {
    it('should update without additional field (if added)', async () => {
      const body = {
        addedField: 'test-added-field',
        character: '験',
        strokes: 18,
      };

      await characterService.updateOne(characterTest.character_id, body);

      const characterUpdated = await CharacterModel.findOne({ character_id: characterTest.character_id }).exec();

      expect(characterUpdated?.character_id).toBe(characterTest.character_id);
      expect(characterUpdated?.strokes).toBe(body.strokes);
      expect(characterUpdated?.character).toBe(body.character);
      expect((characterUpdated as any).addedField).toBeUndefined();
    });
  });
});
