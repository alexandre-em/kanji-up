import { Response } from 'express';

/**
 * Whenever a bad request is sent, this exception is thrown
 * @see Error
 */
export default class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }

  /**
   * Return the error on the response of the request
   * @param response - express response to return the error
   * @returns Send the response with status code 403
   */
  public sendResponse(response: Response) {
    const body = {
      type: 'FORBIDDEN',
      message: `You are not allowed to do this: ${this.message}`,
      date: new Date(Date.now()).toUTCString(),
    };
    return response.status(403).send(body);
  }

  public sendPermissionResponse(response: Response, missingPermissions: string[]) {
    const body = {
      type: 'FORBIDDEN',
      message: `You do not have the permissions to do this: ${this.message}`,
      require: missingPermissions,
      date: new Date(Date.now()).toUTCString(),
    };
    return response.status(403).send(body);
  }
}
