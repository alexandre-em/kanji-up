import express, {Express} from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { mongoConfig, specs } from './config';
import kanjiController from "./controllers/kanji";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

// Database connection
mongoConfig()
    .then(() => console.log('DB: OK'))
    .catch((err) => console.warn('DB: KO ' + err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API Endpoints
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/kanjis', kanjiController);

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
