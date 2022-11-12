/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import { readFileSync, unlinkSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { characterService } from '../services';
import { upload } from "../utils";
import InvalidError from '../error/invalid';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * @openapi
 * /characters:
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
router.post('/', upload.single('image'), urlencodedParser, (req, res) => {
  if (!req.file) return new InvalidError('Character\'s picture is missing !').sendResponse(res);
  const parsedBody = JSON.parse(req.body.json);
  const ext = path.extname((req.file?.filename) as string).split('\.')[1];
  const filePath = path.join('uploads/' + req.file?.filename);
  const image = {
    filename: req.file?.filename,
    data: readFileSync(filePath),
    contentType: `image/${ext}`,
  }
  characterService
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
 * /characters/{id}/info:
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
router.patch('/:id/info', (req, res) => {
  const characterId: string = req.params.id;
  const body = req.body;

  if (!body) new InvalidError('Body can\'t be empty.\nPlease put the field with its value').sendResponse(res);

  characterService.updateOne(characterId, body)
    .then((before) => { res.status(200).send(before); })
    .catch((err) => res.status(400).send(err));
})

/**
 * @openapi
 * /characters/{id}/image:
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
router.put('/:id/image', upload.single('image'), urlencodedParser, (req, res) => {
  if (!req.file) return new InvalidError('Character\'s picture is missing !').sendResponse(res);
  const characterId: string = req.params.id;
  const ext = path.extname(req.file.filename).split('\.')[1];
  const filePath = path.join('uploads/' + req.file.filename);
  const image = {
    filename: req.file.filename,
    data: readFileSync(filePath),
    contentType: `image/${ext}`,
  }

  characterService.updateOneImage(characterId, image)
    .then((before) => {
      unlinkSync(filePath);
      res.status(200).send(before);
    })
    .catch((err) => {
      unlinkSync(filePath);
      res.status(400).send(err)
    });
})

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
