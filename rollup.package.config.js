import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import cleanup from 'rollup-plugin-cleanup';

export default [
    {
        input: 'src/main/cookieManager.ts',
        output: [{ file: './dist/index.js', format: 'esm' }],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }),
            cleanup({ comments: ['jsdoc'] })
        ]
    },
    {
        input: './dist/typings/cookieManager.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'es' }],
        plugins: [dts()]
    }
];
