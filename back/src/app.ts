/* eslint-disable tsdoc/syntax */
import express, {Express} from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { mongoConfig, specs } from './config';
import { KanjiController, CharacterController, RadicalController, ReferenceController, RecognitionController } from "./controllers";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Database connection
mongoConfig()
    .then(() => console.log('DB: OK'))
    .catch((err) => console.warn('DB: KO ' + err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * @openapi
 * tags:
 * - Reference
 * - Character
 * - Radical
 * - Recognition
 * - Kanji
 */

// API Endpoints
app.use('/kanjis', KanjiController);
app.use('/characters', CharacterController);
app.use('/radicals', RadicalController);
app.use('/references', ReferenceController);
app.use('/recognition', RecognitionController);
app.use('/', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
