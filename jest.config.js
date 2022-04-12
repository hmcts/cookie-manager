module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    collectCoverage: false,
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
