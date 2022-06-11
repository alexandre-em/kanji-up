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
export { default as KanjiController } from './kanji';
export { default as CharacterController } from './character';
export { default as RadicalController } from './radical';
export { default as ReferenceController } from './reference';
export { default as RecognitionController } from './recognition';
