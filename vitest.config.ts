/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            reporter: ['text'],
            exclude: [
                'node_modules/',
                'test/common',
                'dist/',
                '*.config.*',
                'coverage/'
            ],
            thresholds: {
                statements: 90,
                branches: 90,
                functions: 90,
                lines: 90
            }
        },
        setupFiles: ['./vitest.setup.ts']
    }
});