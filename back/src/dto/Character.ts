import InvalidError from "../error/invalid";

export default class Character {
    private _id: string;
    private _character: string;
    private _meaning: Array<string>;
    private _onyomi: Array<string>;
    private _kunyomi: Array<string>;
    private _strokes: number;
    private _image: { data: Buffer, contentType: string };
	private _imageUrl: string;

    constructor(character: string, meaning: Array<string>, onyomi: Array<string>, kunyomi: Array<string>, image: ImageType, strokes: number) {
        if (!character || !meaning || !strokes) throw new InvalidError('Character: One or some of arguments are missing `character`, `meaning`, `strokes`');
        this._strokes = strokes;
        this._character = character;
        this._image = image;
        this._onyomi = onyomi;
        this._kunyomi = kunyomi;
        this._meaning = meaning;
    }

    public set id(newId: string) {
        if (!newId) {
            throw new Error('Empty ID');
        }
        this._id = newId;
    }

	public set imageUrl(url: string) {
		this._imageUrl=url;
	}

    public toDTO(): Partial<CharacterType> {
        return {
            id: this._id,
			image: this._imageUrl,
            strokes: this._strokes,
            character: this._character,
            meaning: this._meaning,
            onyomi: this._onyomi,
            kunyomi: this._kunyomi,
        }
    }
}
