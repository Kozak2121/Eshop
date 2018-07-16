module.exports = {
  // resolver: 'jest-webpack-resolver',
  setupFiles: ['raf/polyfill', '<rootDir>/tools/jest/setup.js'],
  collectCoverageFrom: [
    'src/containers/**/*.js',
    'src/components/**/*.js',
    '!src/**/__tests__'
  ],
  globals: {
    __CLIENT__: false
  },
  moduleNameMapper: {
    '.*\\.(css|scss|sass|less)$': '<rootDir>/tools/jest/styleMock.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tools/jest/assetMock.js'
  }
};
