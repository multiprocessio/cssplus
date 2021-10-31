module.exports = {
  coverageThreshold: {
    global: {
      statements: 96,
      branches: 92,
      functions: 100,
      lines: 95,
    },
  },
  transform: {
    "^.+\\.tsx?$": [
      "esbuild-jest",
      {
        sourcemap: true,
      },
    ],
  },
  collectCoverageFrom: ["**/*.ts"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};
