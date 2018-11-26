const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/client',
  resolve: {
    extensions: ['.js', '.ts']
  },
  output: {
    path: path.join(__dirname, '/browser/'),
    filename: 'propagande-min.js',
    library: 'Propagande',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  }
};
