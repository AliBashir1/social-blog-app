// important to name webpack config 

const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './frontend-js/main.js',
  output: {
    filename: 'main-bundled.js',
    path: path.resolve(__dirname, 'public')
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  node: {
    child_process: 'empty',
    fs: 'empty',
    crypto: 'empty',
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
    module: 'empty'
  }
  
}