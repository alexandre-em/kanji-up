/* eslint-disable tsdoc/syntax */
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { mongoConfig, specs } from './config';
import { KanjiRoute, CharacterRoute, RadicalRoute, ReferenceRoute, RecognitionRoute } from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

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
 * - Kanji
 */

// API Endpoints
app.use('/api/v1/kanjis', KanjiRoute);
app.use('/api/v1/characters', CharacterRoute);
app.use('/api/v1/radicals', RadicalRoute);
app.use('/api/v1/references', ReferenceRoute);
// app.use('/api/v1/recognition', RecognitionRoute);
app.use('/', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
