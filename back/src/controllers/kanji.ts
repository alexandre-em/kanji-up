import { Router } from 'express';

import { kanjiService } from '../services';
import InvalidError from '../error/invalid';

const router: Router = Router();

router.get('/:id', async (req, res) => {
    const kanji = await kanjiService.getOne(req.params.id);
    console.log(kanji.kanji);
    
    res.status(200).send(kanji);
});

router.get('/:id/image', async (req, res) => {
    const img = await kanjiService.getOneImage(req.params.id);
    
    res.set('Content-Type', img.contentType);
    res.status(200).send(img.data);
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

export default router;
