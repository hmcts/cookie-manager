import babel from '@rollup/plugin-babel';

export default {
    input: 'src/main/cookieManager.js',
    output: {
        name: 'cookieManager',
        file: 'examples/cookie-manager.js',
        format: 'umd'
    },
    plugins: [
        babel({
            babelHelpers: 'bundled',
            exclude: '**/node_modules/**'
        })
    ]
};
