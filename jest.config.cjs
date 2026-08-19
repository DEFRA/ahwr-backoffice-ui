const sharedConfig = {
  transform: {
    "^.+\\.(mjs|jsx?)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/@defra/(?!(hapi-tracing|hapi-auth-oidc)/)"],
  modulePathIgnorePatterns: ["node_modules"],
  testPathIgnorePatterns: [],
  watchPathIgnorePatterns: ["\\.#"],
  coveragePathIgnorePatterns: [
    "<rootDir>/app/frontend/",
    "<rootDir>/node_modules/",
    "<rootDir>/test-output/",
    "<rootDir>/test/",
    "<rootDir>/jest.config.cjs",
    "<rootDir>/webpack.config.js",
  ],
};

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.js", "!**/*.test.js", "!app/config/*.js"],
  coverageDirectory: "test-output",
  coverageReporters: ["text-summary", "lcov"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        suiteName: "jest tests",
        outputDirectory: "test-output",
        outputName: "junit.xml",
      },
    ],
  ],
  projects: [
    {
      ...sharedConfig,
      displayName: "unit",
      testEnvironment: "node",
      testMatch: ["<rootDir>/test/lib/**/*.test.js", "<rootDir>/app/**/*.test.js"],
      setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    },
    {
      ...sharedConfig,
      displayName: "integration",
      testEnvironment: "<rootDir>/test/environments/jsdom-with-node-globals.cjs",
      testMatch: ["<rootDir>/test/integration/**/*.test.js"],
      setupFilesAfterEnv: ["<rootDir>/test/setup.js", "<rootDir>/test/integration-setup.js"],
    },
    {
      ...sharedConfig,
      displayName: "contract",
      testEnvironment: "node",
      testMatch: ["<rootDir>/test/contract/**/*.test.js"],
      setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    },
  ],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
};
