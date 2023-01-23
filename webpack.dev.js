const {merge} = require('webpack-merge');
const webpackConfig = require('./webpack.config');

module.exports = merge(webpackConfig, {
  mode: 'development',
  entry: './src/index.tsx',
  devServer:{
    port: 3001,
    open: true,
    hot: true,
  },
});