module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "no-console": "off", // під dev дозволено; на prod можна ставити "warn"
    "eqeqeq": ["error", "always"]
  },
  ignorePatterns: ["dist/", "node_modules/"]
};
