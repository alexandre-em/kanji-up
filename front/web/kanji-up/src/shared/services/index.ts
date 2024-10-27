import axios from 'axios';

import KanjiService from './kanji';
import RecognitionService from './recognition';
import UserService from './user';
import WordService from './word';

export type EndpointUrlsType = {
  kanji?: string;
  recognition?: string;
  user?: string;
  word?: string;
};

const defaultEndpointsUrl = {
  kanji: process.env.REACT_APP_KANJI_BASE_URL,
  recognition: process.env.REACT_APP_RECOGNITION_BASE_URL,
  user: process.env.REACT_APP_AUTH_BASE_URL,
  word: process.env.REACT_APP_WORD_BASE_URL,
};

export class Core {
  kanjiService: KanjiService | null = null;
  recognitionService: RecognitionService | null = null;
  userService: UserService | null = null;
  wordService: WordService | null = null;
  private _accessToken: string | null = null;

  constructor() {
    this.kanjiService = new KanjiService(defaultEndpointsUrl.kanji ?? '', '');
    this.recognitionService = new RecognitionService(defaultEndpointsUrl.recognition ?? '', '');
    this.userService = new UserService(defaultEndpointsUrl.user ?? '', '');
    this.wordService = new WordService(defaultEndpointsUrl.word ?? '', '');
  }

  init(accessToken: string, endpointUrls?: EndpointUrlsType) {
    if (endpointUrls?.kanji) this.kanjiService = new KanjiService(endpointUrls.kanji, accessToken);
    if (endpointUrls?.recognition) this.recognitionService = new RecognitionService(endpointUrls.recognition, accessToken);
    if (endpointUrls?.user) this.userService = new UserService(endpointUrls.user, accessToken);
    if (endpointUrls?.word) this.wordService = new WordService(endpointUrls.word, accessToken);
    this._accessToken = accessToken;
  }

  checkSession() {
    return axios.get<string>(`${defaultEndpointsUrl.user}/session/check`, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `Bearer ${this._accessToken}`,
      },
    });
  }

  get accessToken() {
    return this._accessToken!;
  }

  set accessToken(value: string) {
    this._accessToken = value;
  }
}

export default new Core();
