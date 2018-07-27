module.exports = {
   preset: 'jest-preset-angular',
   roots: ['src'],
   setupTestFrameworkScriptFile: '<rootDir>/src/test-jest.ts',
   collectCoverage: true,
   coverageReporters: ['json', 'lcov', 'html', 'text', 'text-summary'],
   coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/test-jest.ts'],
   coverageThreshold: {
      global: {
         branches: 60,
         functions: 60,
         lines: 60,
         statements: -20
      }
   },
   coverageDirectory: '<rootDir>/docs/coverage'
};
