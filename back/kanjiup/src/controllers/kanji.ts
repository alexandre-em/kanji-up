import { Request, Response } from 'express';

import { kanjiService } from '../services';
import InvalidError from '../error/invalid';
import { PAGINATION_LIMIT, UpdateKanjiProps } from '../types/enums';
import NotFoundError from '../error/notFound';

export function getAll(req: Request, res: Response) {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : PAGINATION_LIMIT.LITTLE;
  const grade = (req.query.grade as string) || undefined;

  kanjiService
    .getAll(page, limit, grade)
    .then((kanjis) => {
      res.status(200).send(kanjis);
    })
    .catch((err) => {
      new InvalidError(err.message).sendResponse(res);
    });
}

export async function getOne(req: Request, res: Response) {
  const kanji = await kanjiService.getOne(req.params.id);

  res.status(200).send(kanji);
}

export async function getOneImage(req: Request, res: Response) {
  try {
    const svg = kanjiService.getOneImage(req.params.kanji);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(svg);
  } catch (e) {
    new NotFoundError('Kanji svg image not found').sendResponse(res);
  }
}

export function searchKanji(req: Request, res: Response) {
  const query = req.query.query;
  const pge = parseInt(req.query.page as string);
  const lmt = parseInt(req.query.limit as string);
  const page = req.query.page && !isNaN(pge) ? pge : 1;
  const limit = req.query.limit && !isNaN(lmt) ? lmt : PAGINATION_LIMIT.LITTLE;

  if (!query) return new InvalidError('Search input is empty. Please type a keyword to run a search.').sendResponse(res);
  kanjiService.searchCharacter(query as string, page, limit).then((queryResult) => {
    res.status(200).send(queryResult);
  });
}

export function searchKanjiId(req: Request, res: Response) {
  const query = req.query.query;
  const lmt = parseInt(req.query.limit as string);
  const limit = req.query.limit && !isNaN(lmt) ? lmt : PAGINATION_LIMIT.LITTLE;

  if (!query) return new InvalidError('Search input is empty. Please type a keyword to run a search.').sendResponse(res);
  kanjiService.autocompleteId(query as string, limit).then((queryResult) => {
    res.status(200).send(queryResult);
  });
}

export function createOne(req: Request, res: Response) {
  kanjiService
    .addOne(req.body)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch((err: InvalidError) => {
      console.error(err);
      return err.sendResponse(res);
    });
}

export function updateOneCharacter(req: Request, res: Response) {
  try {
    const { id, characterId } = req.params;

    kanjiService
      .updateOne(id, UpdateKanjiProps.UPDATE_CHARACTER, characterId)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        if (err instanceof InvalidError) return err.sendResponse(res);
        res.status(500).send(err);
      });
  } catch (e) {
    console.error(e);
    if (e instanceof TypeError) res.status(422).send(e);
    res.status(500).send(e);
  }
}

export function updateOneRadical(req: Request, res: Response) {
  try {
    const { id, radicalId } = req.params;

    kanjiService
      .updateOne(id, UpdateKanjiProps.UPDATE_RADICAL, radicalId)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        if (err instanceof InvalidError) return err.sendResponse(res);
        res.status(500).send(err);
      });
  } catch (e) {
    console.error(e);
    if (e instanceof InvalidError) return e.sendResponse(res);
    if (e instanceof TypeError) res.status(422).send(e);
    res.status(500).send(e);
  }
}

export function updateOneReference(req: Request, res: Response) {
  try {
    const { id, referenceId } = req.params;

    kanjiService
      .updateOne(id, UpdateKanjiProps.UPDATE_REFERENCE, referenceId)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        if (err instanceof InvalidError) return err.sendResponse(res);
        res.status(500).send(err);
      });
  } catch (e) {
    console.error(e);
    if (e instanceof InvalidError) return e.sendResponse(res);
    if (e instanceof TypeError) res.status(422).send(e);
    res.status(500).send(e);
  }
}

export function deleteOne(req: Request, res: Response) {
  kanjiService
    .deleteOne(req.params.id as string)
    .then((deletedChar) => res.status(200).send(deletedChar))
    .catch((err) => res.status(400).send(err));
}

export function addKanjiExample(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { body } = req;

    if (!body) new InvalidError("Body can't be empty.\nPlease put the field with its value").sendResponse(res);

    const example: ExampleType = {
      meaning: body.meaning,
      japanese: body.japanese,
    };

    kanjiService
      .addExampleId(id, example)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        if (err instanceof InvalidError) return err.sendResponse(res);
        res.status(500).send(err);
      });
  } catch (e) {
    console.error(e);
    if (e instanceof InvalidError) return e.sendResponse(res);
    if (e instanceof TypeError) res.status(422).send(e);
    res.status(500).send(e);
  }
}

export function removeKanjiExample(req: Request, res: Response) {
  try {
    const { id, index } = req.params;

    kanjiService
      .removeExampleId(id, parseInt(index))
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        if (err instanceof InvalidError) return err.sendResponse(res);
        res.status(500).send(err);
      });
  } catch (e) {
    console.error(e);
    if (e instanceof InvalidError) return e.sendResponse(res);
    if (e instanceof TypeError) res.status(422).send(e);
    res.status(500).send(e);
  }
}

export async function randomKanji(req: Request, res: Response) {
  const number = parseInt(req.query.number as string);

  const randomKanji = await kanjiService.randomKanji(number);

  res.status(200).send(randomKanji);
}
