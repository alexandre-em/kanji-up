/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import { kanjiService } from '../services';
import InvalidError from '../error/invalid';
import { PAGINATION_LIMIT, UpdateKanjiProps } from '../types/enums';

const router: Router = Router();

/**
 * @openapi
 * /kanji:
 *  get:
 *      tags:
 *          - Kanji
 *      description: Paginate list of kanjis
 *      parameters:
 *          - in: query
 *            name: page
 *            description: Page number 
 *            schema:
 *                type: integer
 *          - in: query
 *            name: limit
 *            description: Max element number on a page
 *            schema:
 *                type: integer
 *          - in: query
 *            name: grade
 *            description: Filter kanji by `grade`
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Returns a paginated list of kanji
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KanjiPaginateResponse'
 *          400:
 *              description: Bad request Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.get('', (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : PAGINATION_LIMIT.LITTLE;
  const grade = (req.query.grade as string) || undefined;

  kanjiService.getAll(page, limit, grade)
    .then((kanjis) => {
      res.status(200).send(kanjis);
    })
    .catch((err) => {
      new InvalidError(err.message).sendResponse(res);
    });
});

/**
 * @openapi
 * /kanji/detail/{id}:
 *  get:
 *      tags:
 *          - Kanji
 *      description: Details of a Kanji
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Kanji Id
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Returns kanji's detail
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KanjiResponse'
 *          400:
 *              description: Bad request Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.get('/detail/:id', async (req, res) => {
  const kanji = await kanjiService.getOne(req.params.id);

  res.status(200).send(kanji);
});

/**
 * @openapi
 * /kanji/search:
 *  get:
 *      tags:
 *          - Kanji
 *      description: Search a kanji by keywords
 *      parameters:
 *          - in: query
 *            name: page
 *            description: Page number 
 *            schema:
 *                type: integer
 *          - in: query
 *            name: limit
 *            description: Max element number on a page
 *            schema:
 *                type: integer
 *          - in: query
 *            name: query
 *            description: Query to find a Kanji
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Returns the created reference
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KanjiPaginateResponse'
 *          400:
 *              description: Bad request Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /kanji:
 *  post:
 *      tags:
 *          - Kanji
 *      description: Returns previous character's values
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      required: true
 *                      $ref: '#/components/schemas/KanjiPostBody'
 *      responses:
 *          201:
 *              description: Returns the created kanji
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KanjiResponse'
 *          400:
 *              description: Bad request Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /kanji/{id}/character/{characterId}:
 *  patch:
 *      tags:
 *          - Kanji
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Kanji Id
 *            required: true
 *            schema:
 *                type: string
 *          - name: characterId
 *            in: path
 *            description: Character Id
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Returns the previous kanji values
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KanjiResponse'
 *          400:
 *              description: Bad request Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.patch('/:id/character/:characterId', (req, res) => {
  try {
    const { id, characterId } = req.params;

    kanjiService.updateOne(id, UpdateKanjiProps.UPDATE_CHARACTER, characterId)
      .then((response) => {
        res.status(200).send(response);
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

/**
 * @openapi
 * /kanji/{id}/radical/{radicalId}:
 *  patch:
 *      tags:
 *          - Kanji
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Kanji Id
 *            required: true
 *            schema:
 *                type: string
 *          - name: radicalId
 *            in: path
 *            description: Radical Id
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Returns the previous kanji values
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KanjiResponse'
 *          400:
 *              description: Bad request Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.patch('/:id/radical/:radicalId', (req, res) => {
  try {
    const { id, radicalId } = req.params;

    kanjiService.updateOne(id, UpdateKanjiProps.UPDATE_RADICAL, radicalId)
      .then((response) => {
        res.status(200).send(response);
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

/**
 * @openapi
 * /kanji/{id}/reference/{referenceId}:
 *  patch:
 *      tags:
 *          - Kanji
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Kanji Id
 *            required: true
 *            schema:
 *                type: string
 *          - name: referenceId
 *            in: path
 *            description: Reference Id
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Returns the previous kanji values
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KanjiResponse'
 *          400:
 *              description: Bad request Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.patch('/:id/reference/:referenceId', (req, res) => {
  try {
    const { id, referenceId } = req.params;

    kanjiService.updateOne(id, UpdateKanjiProps.UPDATE_REFERENCE, referenceId)
      .then((response) => {
        res.status(200).send(response);
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

/**
 * @openapi
 * /kanji/{id}:
 *  delete:
 *      tags:
 *          - Kanji
 *      description: Delete a Kanji's values
 *      responses:
 *          200:
 *              description: Returns the deleted kanji
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KanjiResponse'
 *          400:
 *              description: Bad request Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.delete('/:id', (req, res) => {
  kanjiService.deleteOne(req.params.id as string)
    .then((deletedChar) => res.status(200).send(deletedChar))
    .catch((err) => res.status(400).send(err));
})

/**
 * @openapi
 * components:
 *    schemas:
 *        KanjiPatchBody:
 *            type: object
 *            properties:
 *                kanji:
 *                    type: string
 *                radical:
 *                    type: string
 *                reference:
 *                    type: string
 *                examples:
 *                    type: array
 *                    items:
 *                        type: string
 *        KanjiPostBody:
 *            required:
 *                - kanji
 *            type: object
 *            properties:
 *                kanji:
 *                    type: string
 *                radical:
 *                    type: string
 *                reference:
 *                    type: string
 *                examples:
 *                    type: array
 *                    items:
 *                        type: string
 *        KanjiResponse:
 *            type: object
 *            properties:
 *                kanji_id:
 *                    type: string
 *                creation_date:
 *                    type: string
 *                kanji:
 *                    oneOf:
 *                        - type: string
 *                        - $ref: '#/components/schemas/KanjiResponse'
 *                radical:
 *                    oneOf:
 *                        - type: string
 *                        - $ref: '#/components/schemas/ReferenceResponse'
 *                reference:
 *                    oneOf:
 *                        - type: string
 *                        - $ref: '#/components/schemas/RadicalResponse'
 *                examples:
 *                    type: array
 *                    items:
 *                        type: object
 *                        properties:
 *                            japanese:
 *                                type: string
 *                            meaning:
 *                                type: string
 *        KanjiPaginateResponse:
 *            type: object
 *            properties:
 *                totalDocs:
 *                    type: integer
 *                limit:
 *                    type: integer
 *                totalPages:
 *                    type: integer
 *                page:
 *                    type: integer
 *                pagingCounter:
 *                    type: integer
 *                hasPrevPage:
 *                    type: boolean
 *                hasNextPage:
 *                    type: boolean
 *                prevPage:
 *                    type: integer
 *                nextPage:
 *                    type: integer
 *                docs:
 *                    type: array
 *                    items:
 *                        $ref: '#/components/schemas/KanjiResponse'
 */

export default router;
