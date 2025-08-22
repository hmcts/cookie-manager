import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jestPlugin from 'eslint-plugin-jest';

export default [
    js.configs.recommended,
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js', 'eslint.config.js'],
    },
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                exports: 'writable',
                module: 'writable',
                require: 'readonly',
                global: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                location: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                Node: 'readonly',
                NodeList: 'readonly',
                Event: 'readonly',
                CustomEvent: 'readonly',
                MutationObserver: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            'indent': ['error', 4],
            'semi': ['error', 'always'],
            'no-trailing-spaces': ['error', { skipBlankLines: true }],
            'no-useless-constructor': 'off',
            '@typescript-eslint/no-useless-constructor': ['error'],
            'no-undef': 'off', // TypeScript handles this
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }]
        }
    },
    {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        plugins: {
            jest: jestPlugin
        },
        languageOptions: {
            globals: {
                ...jestPlugin.environments.globals.globals,
                jest: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                test: 'readonly'
            }
        },
        rules: {
            ...jestPlugin.configs.recommended.rules
        }
    }
];