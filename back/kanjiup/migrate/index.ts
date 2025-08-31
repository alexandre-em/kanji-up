import { mongoConfig } from '../src/config';
import { migrateJlpt } from './jlpt';
import { migrateFromKanjiApi } from './KanjiApi';
import { migrateFromKanjiDic } from './kanjiDic';

// Database connection
mongoConfig()
  .then(() => {
    (async () => {
      // await migrateFromKanjiApi();
      // await migrateFromKanjiDic();
      await migrateJlpt();
    })();
  })
  .catch((err) => console.warn('DB: KO ' + err));
