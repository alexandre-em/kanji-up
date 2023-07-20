/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import bodyParser from 'body-parser';

import { upload } from '../utils';
import { checkJWT } from '../config/security';
import KanjiPermission from '../utils/kanjiPermissions';
import { createOne } from '../controllers/radical';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * @openapi
 * /api/v1/radicals:
 *  post:
 *      tags:
 *          - Radical
 *      description: <h3>Create a radical object for a kanji</h3> <b>Permissions needed to access the resources:</b> <li>add:kanji</li> <li>add:radical</li>
 *      requestBody:
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      $ref: '#/components/schemas/RadicalPostBody'
 *                  example:
 *                      json: '{ "character": "一", "meaning": ["one"], "onyomi": ["イチ"], "kunyomi": ["ひと"], "strokes": 1 }'
 *      responses:
 *          201:
 *              description: Returns the created radical
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/RadicalResponse'
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
router.post('/', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.ADD_KANJI, KanjiPermission.ADD_RADICAL]), upload.single('image'), urlencodedParser, createOne);

/**
 * @openapi
 * components:
 *    schemas:
 *        RadicalPostBody:
 *            required:
 *                - json
 *                - image
 *            type: object
 *            properties:
 *                json:
 *                    type: string
 *                image:
 *                    type: string
 *                    format: binary
 *        RadicalResponse:
 *            type: object
 *            properties:
 *                radical_id:
 *                    type: string
 *                character:
 *                    type: string
 *                image:
 *                    type: string
 *                strokes:
 *                    type: integer
 *                    minimum: 1
 *                name:
 *                    type: object
 *                    properties:
 *                          hiragana:
 *                                  type: string
 *                          romaji:
 *                                  type: string
 *                meaning:
 *                    type: array
 *                    items:
 *                        type: string
 */

export default router;
