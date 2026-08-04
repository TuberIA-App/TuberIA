// ============================================================================
// ESLint flat configuration (ESLint 10)
// ============================================================================
// Replaces the .eslintrc format, which ESLint 9 removed. Before this file
// existed the repo's `lint` script referenced a config that was never present,
// so linting failed on every run and CI could not gate on it.
// ============================================================================

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    // Build output and dependencies are never linted.
    ignores: ['dist/**', 'node_modules/**', 'public/**'],
  },

  js.configs.recommended,

  {
    // Build/tooling config files run in Node, not the browser: they legitimately
    // use `process`, `__dirname` and friends. Without this the browser-only
    // globals below make `process.env` in vite.config.js a no-undef error.
    files: ['*.config.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  {
    files: ['src/**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      // The React Compiler-era rules from eslint-plugin-react-hooks v7 flag
      // real correctness risks, but fixing them means restructuring component
      // logic (hoisting callbacks above the effects that call them, moving
      // Math.random() out of render, removing setState-in-effect cascades).
      // That is a deliberate React refactor, not something to bundle into an
      // infrastructure change - so they warn loudly rather than block CI.
      //
      // Currently flagged: Input.jsx (Math.random during render),
      // ChannelSearch.jsx (callback used before declaration), and 5
      // set-state-in-effect sites.
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',

      // Vite's Fast Refresh only works when a module exports components and
      // nothing else; warn rather than error so shared constant files that
      // deliberately break the rule do not block a build.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Unused variables: a warning, not an error.
      //
      // This config is new - the repo previously had a `lint` script but no
      // config file at all, so nothing was ever linted. Turning it on surfaced
      // ~38 pre-existing unused imports and variables. Each is harmless on its
      // own and mechanical to remove, but clearing them is an app-code change,
      // not an infrastructure one. Warning keeps them visible without making
      // CI red on code that already shipped. Promote to 'error' once cleared.
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],

      // console.log left in shipped code is noise; warn/error/info are for
      // deliberate diagnostics and stay allowed.
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // New in ESLint 10 and enabled by js.configs.recommended. It flags the
      // ~96 places in the existing service layer that rethrow a new Error
      // without `{ cause }`, losing the original stack. That is a real code
      // quality issue and worth fixing, but it is an application-logic change:
      // downgraded to a warning so it stays visible without turning every CI
      // run red on pre-existing code. Promote back to 'error' once cleared.
      'preserve-caught-error': 'warn',
    },
  },
];
