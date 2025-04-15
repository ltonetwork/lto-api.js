import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const cleanGlobals = Object.fromEntries(Object.entries(globals.browser).map(([k, v]) => [k.trim(), v]));

export default defineConfig([
  globalIgnores(['test/**']),
  {
    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ),

    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...cleanGlobals,
      },

      parser: tsParser,
      ecmaVersion: 13,
      sourceType: 'module',
    },

    settings: {
      'import/extensions': ['.js', '.ts'],
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      'import/extensions': 'off',
    },
  },
]);
