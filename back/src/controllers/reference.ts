import { Router } from 'express';

import { referenceService } from '../services';
import InvalidError from '../error/invalid';

const router: Router = Router();

router.post('/', (req, res) => {
    referenceService
        .addOne(req.body)
        .then((response) => {
            res.status(201).send(response);
        })
        .catch((err: Error) => {
            console.log(err);
            if (err instanceof InvalidError) return err.sendResponse(res);
            res.status(400).send(err.message);
        })
    
})

export default router;
