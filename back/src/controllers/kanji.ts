import { Router } from 'express';
import { kanjiService } from '../services';
import InvalidError from '../error/invalid';
import { PAGINATION_LIMIT, UpdateKanjiProps } from '../types/enums';

const router: Router = Router();

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

router.get('/kanji/:id', async (req, res) => {
  const kanji = await kanjiService.getOne(req.params.id);

  res.status(200).send(kanji);
});

router.get('/search', (req, res) => {
  const query = req.query.query;
  const page = req.query.page && isNaN(parseInt(req.query.page as string)) ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit && isNaN(parseInt(req.query.limit as string)) ? parseInt(req.query.limit as string) : PAGINATION_LIMIT.LITTLE;

  console.log('Test');

  if (!query) return new InvalidError('Search input is empty. Please type a keyword to run a search.').sendResponse(res);
  kanjiService.searchCharacter(query as string, page, limit)
    .then((queryResult) => {
      res.status(200).send(queryResult);
    })
});

// router.get('/:id/image', async (req, res) => {
//     const img = await kanjiService.getOneImage(req.params.id);

//     res.set('Content-Type', img.contentType);
//     res.status(200).send(img.data);
// });

router.post('/', (req, res) => {
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

router.delete('/:id', (req, res) => {
  kanjiService.deleteOne(req.params.id as string)
    .then((deletedChar) => res.status(200).send(deletedChar))
    .catch((err) => res.status(400).send(err));
})

export default router;
