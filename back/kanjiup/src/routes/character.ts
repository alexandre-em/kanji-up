/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import bodyParser from 'body-parser';

import { upload } from '../utils';
import { createOne, updateOneImage, updateOne } from '../controllers/character';
import { checkJWT } from '../config/security';
import KanjiPermission from '../utils/kanjiPermissions';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * @openapi
 * /api/v1/characters:
 *  post:
 *      tags:
 *          - Character
 *      description: Create a character object for a kanji
 *      requestBody:
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      $ref: '#/components/schemas/CharacterPostBody'
 *                  example:
 *                      json: '{ "character": "一", "meaning": ["one"], "onyomi": ["イチ"], "kunyomi": ["ひと"], "strokes": 1 }'
 *      responses:
 *          201:
 *              description: Returns the created reference
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CharacterResponse'
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
router.post(
  '/',
  upload.single('image'),
  urlencodedParser,
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.ADD_KANJI]);
  },
  createOne
);

/**
 * @openapi
 * /api/v1/characters/{id}/info:
 *  patch:
 *      tags:
 *          - Character
 *      description: Returns previous character's values
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Character Id
 *            required: true
 *            schema:
 *                type: string
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      required: true
 *                      $ref: '#/components/schemas/CharacterPatchBody'
 *      responses:
 *          200:
 *              description: Returns the created reference
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CharacterResponse'
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
router.patch(
  '/:id/info',
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.UPDATE_KANJI]);
  },
  updateOne
);

/**
 * @openapi
 * /api/v1/characters/{id}/image:
 *  put:
 *      tags:
 *          - Character
 *      description: Create a character object for a kanji
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Character Id
 *            required: true
 *            schema:
 *                type: string
 *      requestBody:
 *          required: true
 *          content:
 *              image/png:
 *                  schema:
 *                      type: string
 *                      format: binary
 *      responses:
 *          200:
 *              description: Returns previous character's values
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CharacterResponse'
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
router.put(
  '/:id/image',
  upload.single('image'),
  urlencodedParser,
  (req, res, next) => {
    return checkJWT(req, res, next, [KanjiPermission.UPDATE_KANJI]);
  },
  updateOneImage
);

/**
 * @openapi
 * components:
 *    schemas:
 *        CharacterPatchBody:
 *            type: object
 *            properties:
 *                character:
 *                    type: string
 *                meaning:
 *                    type: array
 *                    items:
 *                        type: string
 *                onyomi:
 *                    type: array
 *                    items:
 *                        type: string
 *                kunyomi:
 *                    type: array
 *                    items:
 *                        type: string
 *                strokes:
 *                    type: array
 *                    items:
 *                        type: string
 *        CharacterPostBody:
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
 *        CharacterResponse:
 *            type: object
 *            properties:
 *                character_id:
 *                    type: string
 *                character:
 *                    type: string
 *                meaning:
 *                    type: array
 *                    items:
 *                        type: string
 *                onyomi:
 *                    type: array
 *                    items:
 *                        type: string
 *                kunyomi:
 *                    type: array
 *                    items:
 *                        type: string
 *                strokes:
 *                    type: array
 *                    items:
 *                        type: string
 *                image:
 *                    type: string
 */

export default router;
