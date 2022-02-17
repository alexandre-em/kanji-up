import { Router } from 'express';
import { readFileSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { kanjiService } from '../services';
import { upload, CharacterType } from "../utils";

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/', upload.single('image'), urlencodedParser, (req, res) => {
    const parsedBody = JSON.parse(req.body.json);
    const ext = path.extname(req.file.filename).split('\.')[1];
    const image = {
        data: readFileSync(path.join('uploads/' + req.file.filename)),
        contentType: `image/${ext}`,
    }
    return res.status(200).send(kanjiService.addOne({ ...parsedBody, image }));
});

router.get('/:id/image', async (req, res) => {
    const img: CharacterType = await kanjiService.getOne(req.params.id);
    res.set('Content-Type', img.image.contentType);
    res.status(200).send(img.image.data);
})

export default router;
