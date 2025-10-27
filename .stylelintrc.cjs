module.exports = {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-clean-order" // охайне сортування властивостей
  ],
  plugins: [],
  rules: {
    "color-hex-length": "short",
    "selector-class-pattern": "^[a-z0-9\\-]+$", // kebab-case
    "no-empty-source": null, // не падати на порожніх файлах під час міграцій
  },
  ignoreFiles: [
    "dist/**/*",
    "node_modules/**/*"
  ]
};
