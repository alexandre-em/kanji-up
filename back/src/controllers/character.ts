import { Router } from 'express';
import { readFileSync, unlinkSync } from "fs";
import bodyParser from "body-parser";
import path from "path";

import { characterService } from '../services';
import { upload } from "../utils";
import InvalidError from '../error/invalid';

const router: Router = Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/character', upload.single('image'), urlencodedParser, (req, res) => {
  const parsedBody = JSON.parse(req.body.json);
  const ext = path.extname(req.file.filename).split('\.')[1];
  const filePath = path.join('uploads/' + req.file.filename);
  const image = {
    filename: req.file.filename,
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

router.patch('/:id/info', (req, res) => {
  const characterId: string = req.params.id;
  const body = req.body;

  if (!body) new InvalidError('Body can\'t be empty.\nPlease put the field with its value').sendResponse(res);

  characterService.updateOne(characterId, body)
    .then((before) => { res.status(200).send(before); })
    .catch((err) => res.status(400).send(err));
})

router.put('/:id/image', upload.single('image'), urlencodedParser, (req, res) => {
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

export default router;
