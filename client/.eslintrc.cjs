module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    // './node_modules/gts',
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    }
  },
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true
  },
  rules: {
    "@typescript-eslint/no-namespace": 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/camelcase': 0
  },
  ignorePatterns: ["node_modules/", "public/", "lib/", "dist/", ".idea/"],
  settings: {
    react: {
      version: "detect"
    }
  }
};