module.exports = {
  root: true,
  globals: {
    __dirname: "readonly",
    __filename: "readonly",
    exports: "writable",
    module: "readonly",
    require: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    env: {
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
