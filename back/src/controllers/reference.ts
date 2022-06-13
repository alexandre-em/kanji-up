/* eslint-disable tsdoc/syntax */
import { Router } from 'express';

import { referenceService } from '../services';
import InvalidError from '../error/invalid';

const router: Router = Router();

/**
 * @openapi
 * /references:
 *  post:
 *      tags:
 *          - Reference
 *      description: Create a reference for a kanji
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/ReferencePostBody'
 *      responses:
 *          201:
 *              description: Returns the created reference
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ReferenceResponse'
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
 * components:
 *    schemas:
 *        ReferencePostBody:
 *            required:
 *                - grade
 *            type: object
 *            properties:
 *                grade:
 *                    type: string
 *                kodansha:
 *                    type: string
 *                classic_nelson:
 *                    type: string
 *        ReferenceResponse:
 *            type: object
 *            properties:
 *                reference_id:
 *                    type: string
 *                grade:
 *                    type: string
 *                kodansha:
 *                    type: string
 *                classic_nelson:
 *                    type: string
 */
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
