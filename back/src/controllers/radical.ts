/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import { readFileSync, unlinkSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { radicalService } from '../services';
import { upload } from "../utils";
import InvalidError from '../error/invalid';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/', upload.single('image'), urlencodedParser, (req, res) => {
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
