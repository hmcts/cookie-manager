import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default [
    // package
    {
        input: 'src/main/cookieManager.js',
        output: {
            name: 'cookieManager',
            file: 'index.js',
            format: 'umd'
        },
        plugins: [
            babel({
                babelHelpers: 'bundled',
                exclude: '**/node_modules/**'
            })
        ]
    },
    // minified/dist
    {
        input: 'src/main/cookieManager.js',
        output: {
            name: 'cookieManager',
            file: 'dist/cookie-manager.min.js',
            format: 'umd'
        },
        plugins: [
            babel({
                babelHelpers: 'bundled',
                exclude: '**/node_modules/**'
            }),
            terser({
                compress: {
                    booleans_as_integers: true,
                    pure_getters: true,
                    passes: 2
                }
            })
        ]
    }
];
