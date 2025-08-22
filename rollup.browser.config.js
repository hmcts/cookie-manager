import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' with { type: 'json' };

export default [
    {
        input: 'src/main/cookieManager.ts',
        output: [{ file: './dist/cookie-manager-' + pkg.version + '.min.js', format: 'umd', name: 'cookieManager' }],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false,
                declarationDir: null
            }),
            terser({
                compress: {
                    pure_getters: true,
                    passes: 2
                },
                format: { comments: false }
            })
        ]
    }
];
