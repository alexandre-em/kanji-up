import InvalidError from "../error/invalid";

export default class References {
	private _id: string;
	private _grade: string;
	private _kodansha: string;
	private _classic_nelson: string;

	constructor(grade: string, kodansha: string, classic_nelson: string) {
		if (!grade || !kodansha || !classic_nelson) throw new InvalidError('References: One or some of these arguments are missing: `kodansha`, `grade`, `classic_nelson`');
		
		this._classic_nelson=classic_nelson;
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
