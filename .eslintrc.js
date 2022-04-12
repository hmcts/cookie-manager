module.exports = {
    env: {
        browser: true,
        es6: true,
        jest: true
    },
    extends: [
        'standard'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        indent: ['error', 4],
        semi: [2, 'always'],
        'no-trailing-spaces': ['error', { skipBlankLines: true }],
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': ['error']
    }
};
