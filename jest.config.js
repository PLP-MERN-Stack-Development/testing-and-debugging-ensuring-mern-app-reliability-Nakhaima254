export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/client/src/$1',
  },
  testMatch: [
    '<rootDir>/client/tests/**/*.test.js',
    '<rootDir>/client/tests/**/*.test.jsx',
    '<rootDir>/server/components/**/*.test.jsx',
    '<rootDir>/server/tests/**/*.test.js',
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx}',
    'server/**/*.{js,jsx}',
    '!client/src/main.jsx',
    '!client/src/vite-env.d.ts',
    '!client/src/components/ui/**/*',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};