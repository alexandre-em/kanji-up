/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express';
import { readFileSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { label, upload } from "../utils";

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Loading model
const tfjs = require('@tensorflow/tfjs-node');
const modelPath = 'kanji_saved_model/';
const module_vars = { model: null }
const [modelInputHeight, modelInputWidth] = [48, 48];

const init = async () => {
	module_vars.model = await tfjs.node.loadSavedModel(modelPath);
}

router.post('/', upload.single('image'), urlencodedParser, (req, res) => {
	const ext = path.extname(req.file.filename).split('\.')[1];
	const image = {
		filename: req.file.filename,
		data: readFileSync(path.join('uploads/' + req.file.filename)),
		contentType: `image/${ext}`,
	}

	const view: Uint8Array = new Uint8Array(image.data);
	const tensorImage = tfjs.node.decodeImage(view, 1);
	const resizedImage = tfjs.image.resizeBilinear(tensorImage, [modelInputHeight, modelInputWidth]);
	const loadedModel = module_vars.model;
	const prediction = loadedModel.predict(tfjs.cast(tfjs.expandDims(resizedImage, 0), 'float32'));
	const predictionArray = prediction.arraySync();
	const indexes = predictionArray[0].map((confidence: number, index: number) => confidence === 1 ? index : 0).filter((index: number) => index !== 0);
	const kanjiPredicted = indexes.map((index: number) => label[index]);
	console.log(kanjiPredicted);
	
	res.status(200).send(prediction.arraySync());
});

init();

export default router;
