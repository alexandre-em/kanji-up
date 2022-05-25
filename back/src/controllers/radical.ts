import { Router } from 'express';
import { readFileSync, unlinkSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { radicalService } from '../services';
import { upload } from "../utils";
import InvalidError from '../error/invalid';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/radical', upload.single('image'), urlencodedParser, (req, res) => {
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

export default router;
