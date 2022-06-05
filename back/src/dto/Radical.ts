import InvalidError from "../error/invalid";

type nameType = {
    hiragana: string;
    romaji: string;
}
export default class Radical {
  private _id: string;
  private _character: string;
  private _strokes: number;
  private _image: {
    data: Buffer;
    contentType: string;
  };
	private _imageUrl: string;
  private _name: nameType;
  private _meaning: Array<string>;

	constructor(character: string, strokes: number, image: ImageType, name: nameType, meaning: Array<string>) {
    if (!character || !strokes || !name) throw new InvalidError('Radicals: One or some of these arguments are missing: `character`, `stroke`, `name`');
		this._character=character;
		this._image=image;
		this._meaning=meaning;
		this._name=name;
		this._strokes=strokes;
	}

	
	public get id() : string {
		return this._id;
	}
	

	public set id(newId: string) {
		if (!newId) {
			throw new Error('Empty Id');
		}
		this._id=newId;
	}

	public set imageUrl(url: string) {
		this._imageUrl=url;
	}

	public toDTO() : Partial<RadicalType> {
		return {
			id: this._id,
			image: this._imageUrl,
			character: this._character,
			meaning: this._meaning,
			name: this._name,
			strokes: this._strokes,
		}
	}

}
