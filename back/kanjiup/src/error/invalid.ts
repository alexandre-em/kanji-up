import { Response } from "express";

/**
 * Whenever a bad request is sent, this exception is thrown
 * @see Error
 */
export default class InvalidError extends Error {
	constructor(message: string) {
		super(message);
		this.name="InvalidError";
	}

	/**
	 * Return the error on the response of the request
	 * @param response - express response to return the error
	 * @returns Send the response with status code 422
	 */
	public sendResponse(response: Response) {
		const body = {
			type: "INVALID_REQUEST_ERROR",
			message: this.message,
			date: new Date(Date.now()).toUTCString(),
		};
		return response.status(422).send(body);
	}
}
