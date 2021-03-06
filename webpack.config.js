const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
          test: /\.(less|css)$/,
          use: [
              'style-loader',
              'css-loader',
              {
                  loader: 'less-loader',
                  options: {
                      modifyVars: {"@primary-color": "blue"},
                  }
              }
          ]
      }
    ]
  },
  externals: [nodeExternals()]
};
