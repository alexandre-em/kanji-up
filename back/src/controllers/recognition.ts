/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable tsdoc/syntax */
import { Router } from 'express';
import { readFileSync, unlinkSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { upload } from "../utils";
import { recognitionService } from '../services';
import InvalidError from '../error/invalid';
import NotFoundError from '../error/notFound';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Loading model
const tfjs = require('@tensorflow/tfjs-node');
const modelPath = 'kanji_saved_model/';
const module_vars = { model: null }

const init = async () => {
	module_vars.model = await tfjs.node.loadSavedModel(modelPath);
}

/**
 * @openapi
 * /recognition:
 *  post:
 *      tags:
 *          - Recognition
 *      description: Upload the picture then predict the drawn kanji
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
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.post('/', upload.single('image'), urlencodedParser, (req, res) => {
  if (!req.file) return new InvalidError('Recognition\'s picture is missing !').sendResponse(res);
  if (!module_vars.model) return new InvalidError('Recognition model is missing !').sendResponse(res);
	try {
		const ext = path.extname(req.file.filename).split('\.')[1];
		const { kanji } = JSON.parse(req.body.json);
		const filePath = path.join('uploads/' + req.file.filename);
		const image = {
			filename: req.file.filename,
			data: readFileSync(filePath),
			contentType: `image/${ext}`,
		}

		const loadedModel = module_vars.model;
		const kanjiPredicted = recognitionService.predictKanji(image, loadedModel);

		recognitionService.addOne(kanji, image, kanjiPredicted)
			.then((recognition) => {
				unlinkSync(filePath);

				res.status(200).send(recognition);
			})
			.catch((e) => {
				unlinkSync(filePath);

				throw e;
			});
	} catch (e) {
		console.log(e.message);
		res.status(400).send(e.message);
	}
});

/**
 * @openapi
 * /recognition/validation/{id}:
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
 *      description: Validation of the predicted kanji
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
 *          500:
 *              description: Internal Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.patch('/validation/:id', (req, res) => {
	const { id } = req.params;
	try {
		const is_valid = JSON.parse(req.body.is_valid as string);
		if (typeof is_valid !== 'boolean') new InvalidError('Query param `is_valid` must be a boolean value: `true` or `false`').sendResponse(res);

		recognitionService.updateOne(id, { is_valid })
			.then((before) => {
				if (before === null) new NotFoundError(`Recognition_id not found: ${id}`).sendResponse(res);

				res.status(200).send(before);
			})
			.catch((err) => {
				throw new Error(err);
			})
	} catch (e) {
		res.status(400).send(e.message);
	}
});

init();

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
 *                prediction:
 *                    type: array
 *                    items:
 *                        $ref: '#/components/schemas/Prediction'
 */

export default router;
