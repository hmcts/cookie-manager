import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/main/cookieManager.js',
    output: {
        name: 'CookieManager',
        file: 'dist/cookieManager.js',
        format: 'umd'
    },
    plugins: [
        resolve(),
        terser(),
        babel({
            babelHelpers: 'bundled',
            exclude: '**/node_modules/**'
        })
    ]
};