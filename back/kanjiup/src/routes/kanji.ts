/* eslint-disable tsdoc/syntax */
import { Router } from 'express';

import { checkJWT } from '../config/security';
import KanjiPermission from '../utils/kanjiPermissions';
import {
  addKanjiExample,
  createOne,
  deleteOne,
  getAll,
  getOne,
  getOneImage,
  removeKanjiExample,
  searchKanji,
  searchKanjiId,
  updateOneCharacter,
  updateOneRadical,
  updateOneReference,
} from '../controllers/kanji';

const router: Router = Router();

/**
 * @openapi
 * /api/v1/kanjis:
 *  get:
 *      tags:
 *          - Kanji
 *      description: Paginate list of kanjis
 *      security: []
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
router.get('', getAll);

/**
 * @openapi
 * /api/v1/kanjis/image/{kanji}:
 *  get:
 *      tags:
 *          - Kanji
 *      description: Animated SVG of the Kanji
 *      security: []
 *      parameters:
 *          - name: kanji
 *            in: path
 *            description: Kanji character
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Returns kanji's svg
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
router.get('/image/:kanji', getOneImage);

/**
 * @openapi
 * /api/v1/kanjis/detail/{id}:
 *  get:
 *      tags:
 *          - Kanji
 *      description: Details of a Kanji
 *      security: []
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
router.get('/detail/:id', getOne);
// TODO: Replace /detail/:id by /:id and FIX the response when the kanji is not found (returns 200, expected: 404)

/**
 * @openapi
 * /api/v1/kanjis/search:
 *  get:
 *      tags:
 *          - Kanji
 *      description: Search a kanji by keywords
 *      security: []
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
router.get('/search', searchKanji);

/**
 * @openapi
 * /api/v1/kanjis/search/autocomplete/id:
 *  get:
 *      tags:
 *          - Kanji
 *      description: Autocomplete an input by kanji ids
 *      security: []
 *      parameters:
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
router.get('/search/autocomplete/id', searchKanjiId);

/**
 * @openapi
 * /api/v1/kanjis:
 *  post:
 *      tags:
 *          - Kanji
 *      description: <h3>Returns previous character's values</h3> <b>Permissions needed to access the resources</b> <li>add:kanji</li>
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
 *          401:
 *              description: Authentication Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          403:
 *              description: Unauthorized Error
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
router.post(
  '/',
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.ADD_KANJI]);
  },
  createOne
);

/**
 * @openapi
 * /api/v1/kanjis/{id}/character/{characterId}:
 *  patch:
 *      tags:
 *          - Kanji
 *      description: <b>Permissions needed to access the resources</b> <li>update:kanji</li>
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
 *          401:
 *              description: Authentication Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          403:
 *              description: Unauthorized Error
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
router.patch(
  '/:id/character/:characterId',
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.UPDATE_KANJI]);
  },
  updateOneCharacter
);

/**
 * @openapi
 * /api/v1/kanjis/{id}/radical/{radicalId}:
 *  patch:
 *      tags:
 *          - Kanji
 *      description: <b>Permissions needed to access the resources</b> <li>update:kanji</li>
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
 *          401:
 *              description: Authentication Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          403:
 *              description: Unauthorized Error
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
router.patch(
  '/:id/radical/:radicalId',
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.UPDATE_KANJI]);
  },
  updateOneRadical
);

/**
 * @openapi
 * /api/v1/kanjis/{id}/reference/{referenceId}:
 *  patch:
 *      tags:
 *          - Kanji
 *      description: <b>Permissions needed to access the resources</b> <li>update:kanji</li>
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
 *          401:
 *              description: Authentication Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          403:
 *              description: Unauthorized Error
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
router.patch(
  '/:id/reference/:referenceId',
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.UPDATE_KANJI]);
  },
  updateOneReference
);

/**
 * @openapi
 * /api/v1/kanjis/{id}/examples:
 *  patch:
 *      tags:
 *          - Kanji
 *      description: <b>Permissions needed to access the resources</b> <li>update:kanji</li>
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Kanji Id
 *            required: true
 *            schema:
 *                type: string
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      required: true
 *                      $ref: '#/components/schemas/KanjiExampleBody'
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
 *          401:
 *              description: Authentication Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          403:
 *              description: Unauthorized Error
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
router.patch(
  '/:id/examples',
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.UPDATE_KANJI]);
  },
  addKanjiExample
);

/**
 * @openapi
 * /api/v1/kanjis/{id}/examples/{index}:
 *  delete:
 *      tags:
 *          - Kanji
 *      description: <h3>Delete a Kanji's example</h3> <b>Permissions needed to access the resources:</b> <li>remove:kanji</li>
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Kanji Id
 *            required: true
 *            schema:
 *                type: string
 *          - name: index
 *            in: path
 *            description: Example's Index
 *            required: true
 *            schema:
 *                type: number
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
 *          401:
 *              description: Authentication Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          403:
 *              description: Unauthorized Error
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
router.delete(
  '/:id/examples/:index',
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.UPDATE_KANJI]);
  },
  removeKanjiExample
);

/**
 * @openapi
 * /api/v1/kanjis/{id}:
 *  delete:
 *      tags:
 *          - Kanji
 *      description: <h3>Delete a Kanji's values</h3> <b>Permissions needed to access the resources:</b> <li>remove:kanji</li>
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Kanji Id
 *            required: true
 *            schema:
 *                type: string
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
 *          401:
 *              description: Authentication Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          403:
 *              description: Unauthorized Error
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
router.delete(
  '/:id',
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.REMOVE_KANJI]);
  },
  deleteOne
);

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
 *        KanjiExampleBody:
 *            type: object
 *            properties:
 *                meaning:
 *                    type: string
 *                japanese:
 *                    type: string
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
 *                        - $ref: '#/components/schemas/CharacterResponse'
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
 *                deleted_at:
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
