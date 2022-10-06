export const fileNames = {
  SELECTED_KANJI: 'selectedKanji',
  USER_SCORES: 'userScores',
};

export const readFile = (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try{
      const contents = localStorage.getItem(name);
      if (!contents) { reject(new Error('Selected kanji data not found')); }
      resolve(contents as string);
    } catch (err) {
      reject(err);
    }
  });
};

export const writeFile = (name: string, contents: string) => {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(name, contents);
      resolve(undefined);
    } catch (err) {
      reject(err);
    }
  });
};

