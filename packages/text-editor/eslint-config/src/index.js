const { defineConfig } = require('@coze-arch/eslint-config');

exports.defineWebConfig = function defineWebConfig({
  packageRoot,
  rules,
} = {}) {
  return defineConfig({
    packageRoot,
    preset: 'web',
    rules: {},
    ignores: [
      '**/*.config.*',
      '**/lezer-parser**',
      '**/language-client/**',
      '**/lezer-parser-jinja2/**',
      '**/extension-completion-icons/svg/**',
      '**/extension-completion-icons/scripts/**',
      '**/*.js',
    ],
    rules: {
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/naming-convention': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-extraneous-class': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-invalid-void-type': 'warn',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'off',
      'max-statements-per-line': 'warn',
      'max-params': 'warn',
      'default-case': 'warn',
      eqeqeq: 'warn',
      'max-lines': 'warn',
      'no-cond-assign': 'warn',
      'no-implicit-coercion': 'warn',
      'no-restricted-syntax': 'warn',
      ...(rules ?? {}),
    },
  });
};
