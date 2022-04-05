import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const babelConfig = () => babel({
    babelHelpers: 'bundled',
    exclude: '**/node_modules/**'
});

const terserConfig = () => terser({
    compress: {
        booleans_as_integers: true,
        pure_getters: true,
        passes: 2
    }
});

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
            babelConfig()
        ]
    },
    // examples
    {
        input: 'src/main/cookieManager.js',
        output: {
            name: 'cookieManager',
            file: 'examples/cookie-manager.js',
            format: 'umd'
        },
        plugins: [
            babelConfig()
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
            babelConfig(),
            terserConfig()
        ]
    }
];
