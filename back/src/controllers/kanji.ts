import { Router } from 'express';
import { readFileSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { kanjiService, characterService, radicalService, referenceService } from '../services';
import { upload, CharacterType } from "../utils";
import InvalidError from '../error/invalid';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/:id/image', async (req, res) => {
    const img: CharacterType = await characterService.getOneById(req.params.id);
    console.log(img);
    
    res.set('Content-Type', img.image.contentType);
    res.status(200).send(img.image.data);
})

router.post('/character', upload.single('image'), urlencodedParser, (req, res) => {
    const parsedBody = JSON.parse(req.body.json);
    const ext = path.extname(req.file.filename).split('\.')[1];
    const image = {
        data: readFileSync(path.join('uploads/' + req.file.filename)),
        contentType: `image/${ext}`,
    }
    characterService
        .addOne({ ...parsedBody, image })
        .then((response) => {
            res.status(201).send(response);
        })
        .catch((err: InvalidError) => {
           console.error(err);
            return err.sendResponse(res);
        });
});

router.post('/kanji', (req, res) => {
    kanjiService
        .addOne(req.body)
        .then((response) => {
            res.status(201).send(response);
        })
        .catch((err: InvalidError) => {
            console.error(err);
            return err.sendResponse(res);
        });
});

router.post('/radical', upload.single('image'), urlencodedParser, (req, res) => {
    const parsedBody = JSON.parse(req.body.json);
    const ext = path.extname(req.file.filename).split('\.')[1];
    const image = {
        data: readFileSync(path.join('uploads/' + req.file.filename)),
        contentType: `image/${ext}`,
    }

    radicalService
        .addOne({ ...parsedBody, image })
        .then((response) => {
            res.status(201).send(response);
        })
        .catch((err: InvalidError) => {
            console.error(err);
            return err.sendResponse(res);
        });
});

router.post('/reference', (req, res) => {
    referenceService
        .addOne(req.body)
        .then((response) => {
            res.status(201).send(response);
        })
        .catch((err: InvalidError) => {
            console.log(err);
            return err.sendResponse(res);
        })
    
})

export default router;
