import KanjiService from './kanji';
import RecognitionService from './recognition';
import UserService from './user';

export type EndpointUrlsType = {
  kanji?: string;
  recognition?: string;
  user?: string;
};

const kanjiBaseUrl = process.env.EXPO_PUBLIC_KANJI_BASE_URL;
const recognitionBaseUrl = process.env.EXPO_PUBLIC_RECOGNITION_BASE_URL;
const userBaseUrl = process.env.EXPO_PUBLIC_AUTH_BASE_URL;

export class Core {
  kanjiService: KanjiService | null = null;
  recognitionService: RecognitionService | null = null;
  userService: UserService | null = null;
  private _accessToken: string | null = null;

  constructor() {
    this.kanjiService = new KanjiService(kanjiBaseUrl ?? '', '');
    this.recognitionService = new RecognitionService(recognitionBaseUrl ?? '', '');
    this.userService = new UserService(userBaseUrl ?? '', '');
  }

  init(endpointUrls: EndpointUrlsType, accessToken: string) {
    if (endpointUrls.kanji) this.kanjiService = new KanjiService(endpointUrls.kanji, accessToken);
    if (endpointUrls.recognition) this.recognitionService = new RecognitionService(endpointUrls.recognition, accessToken);
    if (endpointUrls.user) this.userService = new UserService(endpointUrls.user, accessToken);
    this._accessToken = accessToken;
  }

  get accessToken() {
    return this._accessToken!;
  }

  set accessToken(value: string) {
    this._accessToken = value;
  }
}

export default new Core();
