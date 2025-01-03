/* eslint-disable sort-keys-fix/sort-keys-fix */
import harrisConfigBase from 'eslint-config-harris/base';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  ...harrisConfigBase,
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
        Bun: true,
      },
    },
  },
  {
    rules: {
      'no-continue': 'off',
      'no-redeclare': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.mts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off', // typescript compiler handles this directly, not needed for .ts files
    },
  },
  {
    ignores: ['dist', 'docs'],
  },
];

export default eslintConfig;
