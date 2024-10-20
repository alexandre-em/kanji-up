module.exports = {
  ignorePatterns: ["dist", "node_modules", "examples", "scripts"],
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/react-in-jsx-scope": "off", // Pour React 17+
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
        allowSeparatedGroups: true,
      },
    ],

    "import/no-unresolved": "error",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["sibling", "parent"],
          "index",
          "unknown",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
