/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express';
import { readFileSync, unlinkSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { upload } from "../utils";
import { recognitionService } from '../services';
import InvalidError from '../error/invalid';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Loading model
const tfjs = require('@tensorflow/tfjs-node');
const modelPath = 'kanji_saved_model/';
const module_vars = { model: null }

const init = async () => {
	module_vars.model = await tfjs.node.loadSavedModel(modelPath);
}

router.post('/', upload.single('image'), urlencodedParser, (req, res) => {
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
		res.status(400).send(e);
	}
});

router.patch('/validation/:id', (req, res) => {
	const { id } = req.params;
	try {
		const is_valid = JSON.parse(req.body.is_valid as string);
		if (typeof is_valid !== 'boolean') new InvalidError('Query param `is_valid` must be a boolean value: `true` or `false`').sendResponse(res);

		recognitionService.updateOne(id, { is_valid })
			.then((before) => {
				res.status(200).send(before);
			})
			.catch((err) => {
				throw new Error(err);
			})
	} catch (e) {
		res.status(400).send(e);
	}
});

init();

export default router;
