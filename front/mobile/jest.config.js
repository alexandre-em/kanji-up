module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // react-native's own preset only transforms react-native itself (and @react-native-community) —
  // react-native-config ships an untranspiled ESM import statement, so anything that transitively
  // imports it (services/http.ts, and every slice that imports `core` from there) crashed Jest
  // outright. Extends the default pattern rather than replacing it, so the RN packages it already
  // covers stay covered.
  transformIgnorePatterns: ['node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-config)/)'],
};
