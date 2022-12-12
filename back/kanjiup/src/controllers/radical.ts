/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import { readFileSync, unlinkSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { radicalService } from '../services';
import { upload } from "../utils";
import InvalidError from '../error/invalid';
import {checkJWT} from '../config/security';
import KanjiPermission from '../utils/kanjiPermissions';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * @openapi
 * /radicals:
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
router.post('/',(req, res, next) => checkJWT(req, res, next, [KanjiPermission.ADD_KANJI, KanjiPermission.ADD_RADICAL]), upload.single('image'), urlencodedParser, (req, res) => {
  if (!req.file) return new InvalidError('Radical\'s picture is missing !').sendResponse(res);
    const parsedBody = JSON.parse(req.body.json);
    const ext = path.extname(req.file.filename).split('\.')[1];
    const filePath = path.join('uploads/' + req.file.filename);
    const image = {
        filename: req.file.filename,
        data: readFileSync(filePath),
        contentType: `image/${ext}`,
    }

    radicalService
        .addOne({ ...parsedBody, image })
        .then((response) => {
            unlinkSync(filePath);
            res.status(201).send(response);
        })
        .catch((err: InvalidError) => {
            console.error(err);
            unlinkSync(filePath);
            return err.sendResponse(res);
        });
});

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
