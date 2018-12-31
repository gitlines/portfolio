module.exports = {
   preset: 'jest-preset-angular',
   roots: ['src'],
   setupTestFrameworkScriptFile: '<rootDir>/src/test-jest.ts',
   testURL: 'http://localhost', // https://github.com/facebook/jest/issues/6766
   collectCoverage: true,
   coverageReporters: ['json', 'lcov', 'html', 'text', 'text-summary'],
   coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/test-jest.ts', '.*\\.snap'],
   coverageThreshold: {
      global: {
         branches: 60,
         functions: 60,
         lines: 60,
         statements: -20,
      },
   },
   coverageDirectory: '<rootDir>/docs/coverage',
   moduleNameMapper: {
      '@lib/(.*)': '<rootDir>/src/lib/$1',
      '@env/(.*)': '<rootDir>/src/environments/$1',
   },
};
