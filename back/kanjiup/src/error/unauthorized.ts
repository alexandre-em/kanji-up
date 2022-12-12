import { Response } from "express";

/**
 * Whenever a bad request is sent, this exception is thrown
 * @see Error
 */
export default class UnauthorizedError extends Error {
	constructor(message: string) {
		super(message);
		this.name="UnauthorizedError";
	}

	/**
	 * Return the error on the response of the request
	 * @param response - express response to return the error
	 * @returns Send the response with status code 422
	 */
	public sendResponse(response: Response) {
		const body = {
			type: "UNAUTHORIZED",
			message: `You are not allowed to do this: ${this.message}`,
			date: new Date(Date.now()).toUTCString(),
		};
		return response.status(401).send(body);
	}

	public sendPermissionResponse(response: Response, missingPermissions: string[]) {
		const body = {
			type: "UNAUTHORIZED",
			message: `You do not have the permissions to do this: ${this.message}`,
      require: missingPermissions,
			date: new Date(Date.now()).toUTCString(),
		};
		return response.status(403).send(body);
	}
}
