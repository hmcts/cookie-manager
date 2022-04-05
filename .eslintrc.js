module.exports = {
    parser: '@babel/eslint-parser',
    plugins: ['jest'],
    env: {
        browser: true,
        es2021: true,
        jest: true
    },
    extends: [
        'standard'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
        indent: ['error', 4],
        semi: [2, 'always'],
        'no-trailing-spaces': ['error', { skipBlankLines: true }]
    }
};
