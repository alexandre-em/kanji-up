import Character from "../dto/Character";
import InvalidError from "../error/invalid";
import { CharacterModel } from "../models";
import { CharacterType } from "../utils";

export const getOneById = (id: string): Promise<CharacterType> => {
    return CharacterModel.findOne({ character_id: id }).exec();
}

export const addOne = async (body): Promise<Partial<CharacterType>> => {
    const character = new Character(body.character, body.meaning, body.onyomi, body.kunyomi, body.image, body.strokes);

    const r: CharacterType = await new Promise((resolve, reject) => {
        CharacterModel.create(body, (err, res) => {
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

    character.id = r.character_id;

    return character.toDTO();
}
