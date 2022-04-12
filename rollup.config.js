import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: 'src/main/cookieManager.ts',
        output: [{ file: 'dist/index.js', format: 'umd', name: 'cookieManager' }],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' })
        ]
    },
    {
        input: 'src/main/cookieManager.ts',
        output: [{ file: 'dist/cookie-manager.min.js', format: 'umd', name: 'cookieManager' }],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }),
            terser({
                compress: {
                    booleans_as_integers: true,
                    pure_getters: true,
                    passes: 2
                },
                format: { comments: false }
            })
        ]
    },
    {
        input: './dist/typings/cookieManager.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'es' }],
        plugins: [dts()]
    }
];
