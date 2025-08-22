export default {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.ts?$': ['ts-jest', {
            useESM: true
        }]
    },
    testEnvironment: 'jsdom',
    coverageReporters: [['text']],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/test/common'
    ],
    coverageThreshold: {
        global: {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90
        }
    }
};
