/* eslint-disable tsdoc/syntax */
import { Router } from 'express';

import { checkJWT } from '../config/security';
import { createOne } from '../controllers/reference';
import KanjiPermission from '../utils/kanjiPermissions';

const router: Router = Router();

/**
 * @openapi
 * /api/v1/references:
 *  post:
 *      tags:
 *          - Reference
 *      description: <h3>Create a reference for a kanji</h3> <b>Permissions needed to access the resources:</b> <li>add:kanji</li> <li>add:reference</li>
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
 *          401:
 *              description: Authentication Error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          403:
 *              description: Unauthorized Error
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
router.post('/', (req, res, next) => checkJWT(req, res, next, [KanjiPermission.ADD_KANJI, KanjiPermission.ADD_REFERENCE]), createOne);

export default router;
