import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  clearMocks: true,
  coverageProvider: "v8",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
};

export default createJestConfig(config);
