import typescript from '@rollup/plugin-typescript';
import cleanup from 'rollup-plugin-cleanup';
import { copyFileSync } from 'fs';

export default [
    {
        input: 'src/main/cookieManager.ts',
        output: [{ file: './dist/cookie-manager.js', format: 'esm' }],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }),
            cleanup({ comments: ['jsdoc'] }),
            {
                name: 'copy-types',
                writeBundle() {
                    copyFileSync('src/cookie-manager.d.ts', 'dist/cookie-manager.d.ts');
                }
            }
        ]
    }
];
