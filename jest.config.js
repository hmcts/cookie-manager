const path = require("path");
module.exports = {
    transform: {
        "^.+\\.[t|j]sx?$": [
            'babel-jest',
            { configFile: path.join(__dirname, '/src/test/babel.config.js') }
        ]
    },
    collectCoverage: false,
    testEnvironment: "jsdom",
    coverageReporters: [ ["text"] ],
    coveragePathIgnorePatterns:  [
        "/node_modules/",
        "/test/common"
    ],
    coverageThreshold: {
        global: {
            "branches": 90,
            "functions": 90,
            "lines": 90,
            "statements": 90
        }
    }
};