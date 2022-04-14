import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: 'src/main/cookieManager.ts',
        output: [{ file: './dist/cookie-manager.min.js', format: 'umd', name: 'cookieManager' }],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false,
                declarationDir: null
            }),
            terser({
                compress: {
                    booleans_as_integers: true,
                    pure_getters: true,
                    passes: 2
                },
                format: { comments: false }
            })
        ]
    }
];
