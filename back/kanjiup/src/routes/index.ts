/* eslint-disable tsdoc/syntax */
/**
 * @openapi
 * components:
 *    schemas:
 *        Error:
 *            type: object
 *            properties:
 *                type:
 *                    type: string
 *                message:
 *                    type: string
 *                date:
 *                    type: string
 */
export { default as KanjiRoute } from './kanji';
export { default as CharacterRoute } from './character';
export { default as RadicalRoute } from './radical';
export { default as ReferenceRoute } from './reference';
export { default as RecognitionRoute } from './recognition';
