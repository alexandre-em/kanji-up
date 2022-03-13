import Character from "../dto/Character";
import { CharacterModel } from "../models";
import { CharacterType } from "../utils";

export const getOneById = (id: string): Promise<CharacterType> => {
    return CharacterModel.findOne({ character_id: id }).exec();
}

export const addOne = (body): Partial<CharacterType> => {
    const character = new Character(body.character, body.meaning, body.onyomi, body.kunyomi, body.image, body.strokes);
    CharacterModel.create(body, (err, res) => {
        if (err) {
            console.log('[POST] Error: ' + err);
        } else {
            console.log(res.character_id);
            character.id = res.character_id;
        }
    });

    return character.toDTO();
}
