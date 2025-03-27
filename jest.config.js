const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["@testing-library/jest-dom"],  // Adjusted this line
  testEnvironment: "jsdom",
  testMatch: ["**/test/**/*.test.js"], // Matches all test files under src/test
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/pages/(.*)$": "<rootDir>/src/pages/$1",
  },
};

module.exports = createJestConfig(customJestConfig);

