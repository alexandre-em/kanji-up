/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import bodyParser from 'body-parser';

import { upload } from '../utils';
import { checkJWT } from '../config/security';
import KanjiPermission from '../utils/kanjiPermissions';
import { createOne, createTrainData, getOne, getRecognitionModel, updateOneStatus } from '../controllers/recognition';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/model', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.GET_RECOGNITION]), getRecognitionModel);

/**
 * @openapi
 * /api/v1/recognition/all:
 *  get:
 *      tags:
 *          - Recognition
 *      description: <h3>List all recognition</h3> <b>Permissions needed to access the resources:</b> <li>add:kanji</li> <li>read:recognition</li>

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
 *              description: Returns the predicted kanjis and their results
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/RecognitionPaginateResponse'
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
router.get('/all', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.ADD_KANJI, KanjiPermission.GET_RECOGNITION]), getOne);

/**
 * @openapi
 * /api/v1/recognition:
 *  post:
 *      tags:
 *          - Recognition
 *      description: <h3>Upload the picture and kanji prediction of the drawn kanji</h3> <b>Permissions needed to access the resources:</b> <li>add:kanji</li> <li>add:recognition</li>

 *      requestBody:
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      $ref: '#/components/schemas/RecognitionPostBody'
 *                  example:
 *                      json: '{ "kanji": "和" }'
 *      responses:
 *          201:
 *              description: Returns the predicted kanjis with their score and the link of the uploaded drawing (picture)
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/RecognitionResponse'
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
router.post('/', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.ADD_KANJI, KanjiPermission.ADD_RECOGNITION]), upload.single('image'), urlencodedParser, createOne);

router.post('/data', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.ADD_KANJI, KanjiPermission.UPDATE_RECOGNITION]), upload.single('image'), urlencodedParser, createTrainData);

/**
 * @openapi
 * /api/v1/recognition/validation/{id}:
 *  patch:
 *      tags:
 *          - Recognition
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Recognition Id
 *            required: true
 *            schema:
 *                type: string
 *      description: <h3>Validation of the predicted kanji</h3> <b>Permissions needed to access the resources:</b> <li>add:kanji</li> <li>update:recognition</li>
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/RecognitionPatchBody'
 *                  example:
 *                      is_valid: true
 *      responses:
 *          200:
 *              description: Returns the validated or non-validated prediction
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/RecognitionResponse'
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
router.patch('/validation/:id', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.ADD_KANJI, KanjiPermission.UPDATE_RECOGNITION]), updateOneStatus);

/**
 * @openapi
 * components:
 *    schemas:
 *        Prediction:
 *            type: object
 *            properties:
 *                prediction:
 *                    type: string
 *                confidence:
 *                    type: number
 *        RecognitionPostBody:
 *            required:
 *                - json
 *                - image
 *            type: object
 *            properties:
 *                image:
 *                    type: string
 *                    format: binary
 *                json:
 *                    type: string
 *        RecognitionPatchBody:
 *            required:
 *                - is_valid
 *            type: object
 *            properties:
 *                is_valid:
 *                    type: boolean
 *        RecognitionResponse:
 *            type: object
 *            properties:
 *                recognition_id:
 *                    type: string
 *                image:
 *                    type: string
 *                kanji:
 *                    type: string
 *                predictions:
 *                    type: array
 *                    items:
 *                        $ref: '#/components/schemas/Prediction'
 *        RecognitionPaginateResponse:
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
 *                        $ref: '#/components/schemas/RecognitionResponse'
 */

export default router;
