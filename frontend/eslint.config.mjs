export default [
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "coverage/**/*",
      "dist/**/*",
      "build/**/*",
      "*.config.js",
      "*.config.mjs",
      "jest.setup.js",
      "public/sw.js"
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
