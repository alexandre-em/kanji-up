/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import bodyParser from 'body-parser';

import { upload } from '../utils';
import { checkJWT } from '../config/security';
import KanjiPermission from '../utils/kanjiPermissions';
import { createOne, updateOne, updateOneImage } from '../controllers/radical';

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
 *              application/json:
 *                  schema:
 *                      required: true
 *                      $ref: '#/components/schemas/RadicalPostBody'
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
router.post('/', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.ADD_KANJI, KanjiPermission.ADD_RADICAL]), createOne);

/**
 * @openapi
 * /api/v1/radicals/{id}/info:
 *  patch:
 *      tags:
 *          - Radical
 *      description: <h3>Edit a radical</h3> <b>Permissions needed to access the resources:</b> <li>update:radical</li>
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Radical Id
 *            required: true
 *            schema:
 *                type: string
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      required: true
 *                      $ref: '#/components/schemas/RadicalPatchBody'
 *      responses:
 *          200:
 *              description: Returns the updated radical
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
router.patch('/:id', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.UPDATE_RADICAL]), updateOne);

/**
 * @openapi
 * /api/v1/radicals/{id}/image:
 *  put:
 *      tags:
 *          - Radical
 *      description: <h3>Upload and update a radical image</h3> <b>Permissions needed to access the resources:</b> <li>update:radical</li>
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Radical Id
 *            required: true
 *            schema:
 *                type: string
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      required: true
 *                      $ref: '#/components/schemas/RadicalPatchImage'
 *      responses:
 *          200:
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
router.put('/:id/image', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.UPDATE_RADICAL]), upload.single('file'), urlencodedParser, updateOneImage);

/**
 * @openapi
 * components:
 *    schemas:
 *        RadicalPatchBody:
 *            type: object
 *            properties:
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
 *        RadicalPatchImage:
 *            type: object
 *            required:
 *                - file
 *            properties:
 *                file:
 *                    type: string
 *                    format: binary
 *        RadicalPostBody:
 *            required:
 *                - character
 *                - strokes
 *                - name
 *                - meaning
 *            type: object
 *            properties:
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
