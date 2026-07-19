module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/models/**/*.js',
    'src/middlewares/**/*.js',
    'src/utils/**/*.js'
  ],
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.spec.js']
};
