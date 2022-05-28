import { mongoConfig } from '../src/config';
import { migrateFromKanjiApi } from './KanjiApi';
import { migrateFromKanjiDic } from './kanjiDic';

// Database connection
mongoConfig()
	.then(() => {
		// migrateFromKanjiApi()
		migrateFromKanjiDic()
	})
	.catch((err) => console.warn('DB: KO ' + err));
