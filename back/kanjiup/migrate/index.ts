import { mongoConfig } from '../src/config';
import { migrateFromKanjiApi } from './KanjiApi';
import { migrateFromKanjiDic } from './kanjiDic';

// Database connection
mongoConfig()
	.then(() => {
		(async () => {
			await migrateFromKanjiApi();
			await migrateFromKanjiDic();
		})();
	})
	.catch((err) => console.warn('DB: KO ' + err));
