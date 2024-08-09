module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
    "linebreak-style": ["error", "unix"],
    "max-len": ["error", { "code": 120 }],
    "object-curly-spacing": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "no-trailing-spaces": "error",
    "require-jsdoc": "off",
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
