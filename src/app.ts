import express, {Express} from 'express';
import bodyParser from "body-parser";

import connectToDatabase from './config/mongo';
import kanjiController from "./controllers/kanji";

const app: Express = express();
const port = 8080;

// Database connection
connectToDatabase()
    .then(() => console.log('DB: OK'))
    .catch(() => console.warn('DB: KO'));

// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API Endpoints
app.use('/kanji', kanjiController);

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
