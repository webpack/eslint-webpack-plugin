module.exports = {
  ignorePatterns: ["**/ignore.js"],
  globals: {
    __dirname: "readonly",
    __filename: "readonly",
    exports: "writable",
    module: "readonly",
    require: "readonly",
    console: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    env: {
      browser: true,
      node: true,
      es6: true,
    },
    sourceType: "module",
  },
  rules: {
    "no-console": "warn",

    "no-undef": "error",
    "no-var": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
  },
};
