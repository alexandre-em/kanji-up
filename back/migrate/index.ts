import { mongoConfig } from '../src/config';
import { migrateFromKanjiApi } from './KanjiApi';

// Database connection
mongoConfig()
	.then(() => {
		migrateFromKanjiApi()
	})
	.catch((err) => console.warn('DB: KO ' + err));
