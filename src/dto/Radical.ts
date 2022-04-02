import InvalidError from "../error/invalid";


export default class Radical {
  private _id: string;
  private _character: string;
  private _stroke: number;
  private _image: {
    data: Buffer;
    contentType: string;
  };
  private _name: {
    hiragana: string;
    romaji: string;
  };
  private _meaning: Array<string>;

	constructor(character: string, stroke: number, image: any, name: any, meaning: Array<string>) {
    if (!character || !stroke || !name) throw new InvalidError('Radicals: One or some of these arguments are missing: `character`, `stroke`, `name`');
		this._character=character;
		this._image=image;
		this._meaning=meaning;
		this._name=name;
		this._stroke=stroke;
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

	public toDTO() {
		return {
			id: this._id,
			character: this._character,
			meaning: this._meaning,
			name: this._name,
			stroke: this._stroke,
		}
	}

}