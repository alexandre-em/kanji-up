import { Router } from 'express';

import { referenceService } from '../services';
import InvalidError from '../error/invalid';

const router: Router = Router();

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
