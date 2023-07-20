import { Request, Response } from 'express';
import { readFileSync, unlinkSync } from 'fs';
import path from 'path';

import { radicalService } from '../services';
import InvalidError from '../error/invalid';

export function createOne(req: Request, res: Response) {
  if (!req.file) return new InvalidError("Radical's picture is missing !").sendResponse(res);
  const parsedBody = JSON.parse(req.body.json);
  const ext = path.extname(req.file.filename).split('.')[1];
  const filePath = path.join('uploads/' + req.file.filename);
  const image = {
    filename: req.file.filename,
    data: readFileSync(filePath),
    contentType: `image/${ext}`,
  };

  radicalService
    .addOne({ ...parsedBody, image })
    .then((response) => {
      unlinkSync(filePath);
      res.status(201).send(response);
    })
    .catch((err: InvalidError) => {
      console.error(err);
      unlinkSync(filePath);
      return err.sendResponse(res);
    });
}
