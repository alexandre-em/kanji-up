import e, { Router } from 'express';

import { kanjiService } from '../services';
import InvalidError from '../error/invalid';

const router: Router = Router();

router.get('/:id', async (req, res) => {
  const kanji = await kanjiService.getOne(req.params.id);

  res.status(200).send(kanji);
});

router.get('', (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : PAGINATION_LIMIT.LITTLE;
  const grade = (req.query.grade as string) || null;

  kanjiService.getAll(page, limit, grade)
    .then((kanjis) => {
      res.status(200).send(kanjis);
    })
    .catch((err) => {
      new InvalidError(err.message).sendResponse(res);
    });
});

// router.get('/:id/image', async (req, res) => {
//     const img = await kanjiService.getOneImage(req.params.id);

//     res.set('Content-Type', img.contentType);
//     res.status(200).send(img.data);
// });

router.post('/kanji', (req, res) => {
  kanjiService
    .addOne(req.body)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch((err: InvalidError) => {
      console.error(err);
      return err.sendResponse(res);
    });
});

router.patch('/:id/character/:characterId', (req, res) => {
  try {
    const { id, characterId } = req.params;

    kanjiService.updateOne(id, UpdateKanjiProps.UPDATE_CHARACTER, characterId)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch((err) => {
        if (err instanceof InvalidError)
          return err.sendResponse(res);
        res.status(500).send(err);
      })
  } catch (e) {
    console.error(e);
    if (e instanceof TypeError)
      res.status(422).send(e);
    res.status(500).send(e);
  }
});

router.patch('/:id/radical/:radicalId', (req, res) => {
  try {
    const { id, radicalId } = req.params;

    kanjiService.updateOne(id, UpdateKanjiProps.UPDATE_RADICAL, radicalId)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch((err) => {
        if (err instanceof InvalidError)
          return err.sendResponse(res);
        res.status(500).send(err);
      })
  } catch (e) {
    console.error(e);
    if (e instanceof InvalidError)
      return e.sendResponse(res);
    if (e instanceof TypeError)
      res.status(422).send(e);
    res.status(500).send(e);
  }
});

router.patch('/:id/reference/:referenceId', (req, res) => {
  try {
    const { id, referenceId } = req.params;

    kanjiService.updateOne(id, UpdateKanjiProps.UPDATE_REFERENCE, referenceId)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch((err) => {
        if (err instanceof InvalidError)
          return err.sendResponse(res);
        res.status(500).send(err);
      })
  } catch (e) {
    console.error(e);
    if (e instanceof InvalidError)
      return e.sendResponse(res);
    if (e instanceof TypeError)
      res.status(422).send(e);
    res.status(500).send(e);
  }
});

export default router;
