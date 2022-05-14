module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'plugin:@typescript-eslint/recommended'
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    project: './tsconfig.json',
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-tsdoc'
  ],
  'rules': {
    'tsdoc/syntax': 'warn'
  },
};
