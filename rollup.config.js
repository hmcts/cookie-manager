import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
    input: 'src/cookieManager.js',
    output: {
        name: 'CookieManager',
        file: 'dist/cookieManager.js',
        format: 'umd'
    },
    plugins: [resolve(), babel({ babelHelpers: 'bundled' })]
};