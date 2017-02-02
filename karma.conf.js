const webpack = {
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    noParse: [
      /node_modules\/sinon/
    ],
    loaders: [
      { test: /\.js(x|)$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
};

module.exports = function configure(config) {
  config.set({
    basePath: '',
    files: [
      { pattern: 'test.js', watched: true }
    ],
    preprocessors: {
      'test.js': ['webpack', 'sourcemap']
    },
    webpack,
    frameworks: ['mocha'],
    reporters: ['mocha'],
    mochaReporter: {
      output: process.env.CI ? 'minimal' : 'autowatch'
    },
    browsers: ['PhantomJS']
  });
};
