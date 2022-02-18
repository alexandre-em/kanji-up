import {CharacterType} from "../utils/types";

export default class Character {
    private _id: string;
    private _character: string;
    private _meaning: Array<string>;
    private _onyomi: Array<string>;
    private _kunyomi: Array<string>;
    private _strokes: number;
    private _image: { data: Buffer, contentType: string };

    constructor(character: string, meaning: Array<string>, onyomi: Array<string>, kunyomi: Array<string>, image: any, strokes: number) {
        this._strokes=strokes;
        this._character=character;
        this._image=image;
        this._onyomi=onyomi;
        this._kunyomi=kunyomi;
        this._meaning=meaning;
    }

    public set id(newId: string) {
        if (!newId) {
            throw new Error('Empty ID');
        }
        this._id=newId;
    }

    public toDTO(): Partial<CharacterType> {
        return {
            id: this._id,
            strokes: this._strokes,
            character: this._character,
            meaning: this._meaning,
            onyomi: this._onyomi,
            kunyomi: this._kunyomi,
        }
    }
}
