import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.claude/worktrees', 'e2e', 'playwright.config.js']),

  // ── Config principale (browser) ──────────────────────────────────────────────
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Patterns légitimes de reset de state dans les effets (sync avec props)
      'react-hooks/set-state-in-effect': 'warn',
      // React Compiler — ne peut pas préserver les useMemo manuels (pas bloquant)
      'react-hooks/preserve-manual-memoization': 'warn',
      // Contextes / fichiers mixtes (hooks + composants)
      'react-refresh/only-export-components': 'warn',
    },
  },

  // ── Serveur Node.js ───────────────────────────────────────────────────────────
  {
    files: ['server/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // ── Tests (vitest / jsdom) ────────────────────────────────────────────────────
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, global: 'readonly' },
    },
  },
])
