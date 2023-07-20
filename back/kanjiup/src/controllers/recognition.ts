/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable tsdoc/syntax */
import { Request, Response } from 'express';
import { readFileSync, unlinkSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { recognitionService } from '../services';
import InvalidError from '../error/invalid';
import NotFoundError from '../error/notFound';
import { PAGINATION_LIMIT } from '../types/enums';

dotenv.config();

export function getRecognitionModel(req: Request, res: Response) {
  const model = req.query.model;
  if (model && model === process.env.KANJI_RECOGNIZER_KEY) {
    const uris = {
      web: process.env.KANJI_RECOGNIZER_WEB,
      native: process.env.KANJI_RECOGNIZER_NATIVE,
    };

    res.status(200).send(uris);
  } else {
    res.status(403).send(new Error('Not allowed to access this route or specify what you want to do with'));
  }
}

export function getOne(req: Request, res: Response) {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : PAGINATION_LIMIT.LITTLE;
  const query = (req.query.query as string) || undefined;

  recognitionService
    .getAll(page, limit, query)
    .then((recognitions) => {
      res.status(200).send(recognitions);
    })
    .catch((err) => {
      new InvalidError(err.message).sendResponse(res);
    });
}

export function createOne(req: Request, res: Response) {
  if (!req.file) return new InvalidError("Recognition's picture is missing !").sendResponse(res);
  try {
    const ext = path.extname(req.file.filename).split('.')[1];
    const { kanji, predictions } = JSON.parse(req.body.json);
    const filePath = path.join(`uploads/${req.file.filename}`);
    const image = {
      filename: req.file.filename,
      data: readFileSync(filePath),
      contentType: `image/${ext}`,
    };

    recognitionService
      .addOne(kanji, image, predictions)
      .then((recognition) => {
        unlinkSync(filePath);

        res.status(200).send(recognition);
      })
      .catch((e) => {
        unlinkSync(filePath);

        throw e;
      });
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
}

export function createTrainData(req: Request, res: Response) {
  if (!req.file) return new InvalidError("Recognition's picture is missing !").sendResponse(res);
  try {
    const ext = path.extname(req.file.filename).split('.')[1];
    const { kanji } = JSON.parse(req.body.json);
    const filePath = path.join(`uploads/${req.file.filename}`);
    const image = {
      filename: req.file.filename,
      data: readFileSync(filePath),
      contentType: `image/${ext}`,
    };

    recognitionService
      .addOneData(kanji, image)
      .then((recognition: AWS.S3.ManagedUpload.SendData) => {
        unlinkSync(filePath);

        res.status(200).send(recognition);
      })
      .catch((e) => {
        unlinkSync(filePath);

        throw e;
      });
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
}

export function updateOneStatus(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const is_valid = JSON.parse(req.body.is_valid as string);
    if (typeof is_valid !== 'boolean') new InvalidError('Query param `is_valid` must be a boolean value: `true` or `false`').sendResponse(res);

    recognitionService
      .updateOne(id, { is_valid })
      .then((before) => {
        if (before === null) new NotFoundError(`Recognition_id not found: ${id}`).sendResponse(res);

        res.status(200).send(before);
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (e) {
    res.status(400).send(e.message);
  }
}
