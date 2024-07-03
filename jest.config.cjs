module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    "/node_modules/(?!clui|yargs).+\\.js$",
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};
