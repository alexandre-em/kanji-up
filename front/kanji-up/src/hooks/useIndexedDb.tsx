export default function useIndexedDb() {
  return (download: ArrayBuffer | null, type: string) => new Promise((resolve) => {
    const dbconnect = indexedDB.open('internalModels', 1);

    dbconnect.onupgradeneeded = (ev: any) => {
      const db = ev.target.result;
      const store = db.createObjectStore('model', { keyPath: 'Type' });
      store.createIndex('Type', 'Type', { unique: true });
      store.createIndex('Buffer', 'Buffer', { unique: true });
    };

    dbconnect.onsuccess = (dbEv: any) => {
      const db = dbEv.target.result;
      const transaction = db.transaction('model', 'readwrite');
      const dbStore = transaction.objectStore('model');

      if (download) {
        dbStore.put({
          Type: type,
          Buffer: download,
        });
      }

      transaction.onerror = (errorEv: any) => {
        throw new Error(`An error occurred : ${errorEv.target.error.message}`);
      };

      transaction.oncomplete = () => {
        const transactionStore = db.transaction('model', 'readonly').objectStore('model');
        const query = transactionStore.openCursor();

        query.onerror = (errorEv: any) => {
          throw new Error(`Request failed: ${errorEv.target.error.message}`);
        };

        const payload: any = {};
        query.onsuccess = (queryEv: any) => {
          const cursor = queryEv.target.result;
          if (cursor) {
            payload[cursor.value.Type] = cursor.value.Buffer;
            cursor.continue();
          } else {
            resolve(payload);
          }
        };
      };
    };
  });
};

