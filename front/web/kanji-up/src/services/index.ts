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
  kanji: process.env.REACT_APP_KANJI_BASE_URL!,
  recognition: process.env.REACT_APP_RECOGNITION_BASE_URL!,
  user: process.env.REACT_APP_AUTH_BASE_URL!,
  word: process.env.REACT_APP_WORD_BASE_URL!,
};

export class Core {
  kanjiService: KanjiService | null;
  recognitionService: RecognitionService | null;
  userService: UserService | null;
  wordService: WordService | null;
  private _accessToken: string | null;

  constructor() {
    this.kanjiService = new KanjiService(defaultEndpointsUrl.kanji, '');
    this.recognitionService = new RecognitionService(defaultEndpointsUrl.recognition, '');
    this.userService = new UserService(defaultEndpointsUrl.user, '');
    this.wordService = new WordService(defaultEndpointsUrl.word, '');
    this._accessToken = null;
  }

  init(accessToken: string, endpointUrls?: EndpointUrlsType) {
    if (accessToken) {
      this.kanjiService = new KanjiService(endpointUrls?.kanji || defaultEndpointsUrl.kanji, accessToken);
      this.recognitionService = new RecognitionService(endpointUrls?.recognition || defaultEndpointsUrl.recognition, accessToken);
      this.userService = new UserService(endpointUrls?.user || defaultEndpointsUrl.user, accessToken);
      this.wordService = new WordService(endpointUrls?.word || defaultEndpointsUrl.word, accessToken);
      this._accessToken = accessToken;
    }
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
}

export default new Core();
