import InvalidError from "../error/invalid";

export default class References {
	private _id: string;
	private _grade: string;
	private _kodansha: string;
	private _classic_nelson: string;

	constructor(grade: string, kodansha: string, classicNelson: string) {
		if (!grade || !kodansha || !classicNelson) throw new InvalidError('References: One or some of these arguments are missing: `kodansha`, `grade`, `classicNelson`');
		
		this._classic_nelson=classicNelson;
		this._grade=grade;
		this._kodansha=kodansha;
	}
	
	public get id() : string {
		return this._id;
	}
	
	public set id(newId : string) {
		this.id = newId;
	}

	public toDTO(id: string) {
		return {
			id,
			grade: this._grade,
			kodansha: this._kodansha,
			classic_nelson: this._classic_nelson,
		}
	}
	
}
