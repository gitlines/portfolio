module.exports = {
   preset: 'jest-preset-angular',
   roots: ['src'],
   setupTestFrameworkScriptFile: '<rootDir>/src/test-jest.ts',
   coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/test-jest.ts']
};
