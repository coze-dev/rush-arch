const { defineWebConfig } = require('@coze-editor/eslint-config');

module.exports = defineWebConfig({
  packageRoot: __dirname,
  rules: {
    'react-hooks/rules-of-hooks': 'off',
  },
});
