import { Config } from 'react-native-config';

import AuthService from './auth';
import KanjiService from './kanji';
import SessionsService from './sessions';
import WordService from './word';

export type EndpointUrlsType = {
  kanji?: string;
  auth?: string;
  word?: string;
};

const defaultEndpoints: EndpointUrlsType = {
  kanji: Config.KANJI_BASE_URL,
  auth: Config.AUTH_BASE_URL,
  word: Config.WORD_BASE_URL,
};

export class AxiosInstance {
  kanjiService: KanjiService | null = null;
  wordService: WordService | null = null;
  authService: AuthService | null = null;
  sessionsService: SessionsService | null = null;

  constructor() {
    if (!defaultEndpoints.auth || !defaultEndpoints.kanji || !defaultEndpoints.word) throw new Error('Endpoints not ready');
    this.authService = new AuthService(defaultEndpoints.auth);
    this.kanjiService = new KanjiService(defaultEndpoints.kanji);
    this.wordService = new WordService(defaultEndpoints.word);
    // Sessions live in the same backend as auth (kanji-up-auth), just a different route namespace
    this.sessionsService = new SessionsService(defaultEndpoints.auth);
  }
}

export const core = new AxiosInstance();
