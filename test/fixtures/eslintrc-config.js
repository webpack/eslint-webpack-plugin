module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    env: {
      es6: true,
      jest: true,
    },
    sourceType: 'module',
  },
  rules: {
    strict: 'error',
    'global-require': 'off',
  },
};
