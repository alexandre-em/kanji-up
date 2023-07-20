import { Response, Request } from 'express';

import { referenceService } from '../services';
import InvalidError from '../error/invalid';

export function createOne(req: Request, res: Response) {
  referenceService
    .addOne(req.body)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch((err: Error) => {
      console.log(err);
      if (err instanceof InvalidError) return err.sendResponse(res);
      res.status(400).send(err.message);
    });
}
