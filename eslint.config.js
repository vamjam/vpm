import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts']

const typescriptConfigs = tseslint.configs['flat/recommended'].map(
  (config) => ({
    ...config,
    files: config.files ?? tsFiles,
    languageOptions: {
      ...(config.languageOptions ?? {}),
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2024,
        ...globals.browser,
        ...globals.node,
        ...(config.languageOptions?.globals ?? {}),
      },
      parserOptions: {
        ...(config.languageOptions?.parserOptions ?? {}),
        project: './tsconfig.json',
      },
    },
  }),
)

const reactHooksConfig = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  plugins: {
    'react-hooks': reactHooks,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
  },
}

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      '**/node_modules/**',
      '**/dist/**',
      '**/generated/**',
    ],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2024,
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...typescriptConfigs,
  reactHooksConfig,
  prettierRecommended,
  {
    files: tsFiles,
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
]
