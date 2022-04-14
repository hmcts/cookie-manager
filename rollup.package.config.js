import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'src/main/cookieManager.ts',
        output: [{ file: './dist/index.js', format: 'esm' }],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' })
        ]
    },
    {
        input: './dist/typings/cookieManager.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'es' }],
        plugins: [dts()]
    }
];
