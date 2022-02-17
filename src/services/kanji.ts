import {Promise} from "mongoose";

import {CharacterModel} from "../models";
import {CharacterType} from "../utils";
import Character from "../dto/Character";

export const getOne = (id: string): Promise<CharacterType> => {
    return CharacterModel.findOne({ character_id: id }).exec();
}

export const getAll = (req, res) => {

}

export const addOne = (body): Partial<CharacterType> => {
    const character = new Character(body.character, body.meaning, body.onyomi, body.kunyomi, body.image);
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

export const updateOne = (res, req) => {

}

export const deleteOne = (res, req) => {

}
