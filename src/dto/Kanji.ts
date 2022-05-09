import { CharacterType, RadicalType, ReferenceType } from "../utils";

const formatCharacter = ({ character_id, character, strokes, meaning, onyomi, kunyomi }: CharacterType) => ({
	character_id, character, strokes, meaning, onyomi, kunyomi,
})

const formatRadical = ({ radical_id, character, stroke, name, meaning }: RadicalType) => ({
	radical_id, character, stroke, name, meaning,
})

export default class Kanji {
	private _id: string;
	private _character: Partial<CharacterType>;
	private _radical: Partial<RadicalType>;
	private _reference: ReferenceType;
	private _creationDate: string;
	private _examples: Array<{ japanese: string, meaning: string }>;

	constructor(character: CharacterType, radical: RadicalType, reference: ReferenceType, examples: Array<{ japanese: string, meaning: string }>) {
		if (!character || !radical || !reference) throw new Error('Character: One or some of arguments id are missing `character`, `radical`, `reference`');
		this._character = formatCharacter(character);
		this._radical = formatRadical(radical);
		this._reference = reference;
		this._examples = examples;
	}

	public set id(newId: string) {
		if (!newId) {
			throw new Error('Empty ID');
		}
		this._id = newId;
	}


	public set creationDate(newDate: string) {
		this._creationDate = newDate;
	}

	public toDTO(id:string, creationDate:string) {
		return {
			id,
			radical: this._radical,
			character: this._character,
			reference: this._reference,
			creationDate,
			examples: this._examples,
		}
	}
}
