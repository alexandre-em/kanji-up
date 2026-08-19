jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Config resolves from a native module (RNCConfigModule) unavailable under Jest, so it's always
// {} in tests — services/http.ts's module-scope `core = new AxiosInstance()` throws "Endpoints
// not ready" on import otherwise, crashing every test that transitively imports it. Fake but
// non-empty values are enough to satisfy that guard; nothing here makes a real network call.
jest.mock('react-native-config', () => {
  const mockConfig = {
    AUTH_BASE_URL: 'http://localhost',
    KANJI_BASE_URL: 'http://localhost',
    WORD_BASE_URL: 'http://localhost',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    ADMOB_APP_ID: 'test-admob-app-id',
    ADMOB_BANNER_UNIT_ID: 'test-admob-banner-unit-id',
    ADMOB_INTERSTITIAL_UNIT_ID: 'test-admob-interstitial-unit-id',
    ADMOB_REWARDED_UNIT_ID: 'test-admob-rewarded-unit-id',
  };

  return { Config: mockConfig, default: mockConfig };
});
