declare module 'react-native-config' {
  export interface NativeConfig {
    // Declare all environment variables here
    KANJI_BASE_URL?: string;
    WORD_BASE_URL?: string;
    AUTH_BASE_URL?: string;
    GOOGLE_CLIENT_ID?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
