const sharedConfig = {
  transform: {
    "^.+\\.[j]sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/@defra/(?!(hapi-tracing)/)"],
  modulePathIgnorePatterns: ["node_modules"],
  testPathIgnorePatterns: [],
  watchPathIgnorePatterns: ["\\.#"],
};

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.js", "!**/*.test.js", "!app/config/**/*.js"],
  coverageDirectory: "test-output",
  coverageReporters: ["text-summary", "lcov"],
  coveragePathIgnorePatterns: [
    "<rootDir>/app/frontend/",
    "<rootDir>/node_modules/",
    "<rootDir>/test-output/",
    "<rootDir>/test/",
    "<rootDir>/jest.config.cjs",
    "<rootDir>/webpack.config.js",
  ],
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
      testMatch: [
        "<rootDir>/test/unit/**/*.test.js",
        "<rootDir>/test/lib/**/*.test.js",
        "<rootDir>/app/**/*.test.js",
      ],
      setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    },
    {
      ...sharedConfig,
      displayName: "integration",
      testEnvironment: "<rootDir>/test/environments/jsdom-with-node-globals.cjs",
      testMatch: ["<rootDir>/test/integration/**/*.test.js"],
      setupFilesAfterEnv: ["<rootDir>/test/setup.js", "<rootDir>/test/integration-setup.js"],
    },
  ],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
};
