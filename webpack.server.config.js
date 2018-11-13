const path = require('path');
/* eslint-disable node/no-missing-require, node/no-extraneous-require */
const webpack = require('webpack'); // We use the webpack installed by angular devkit
/* eslint-enable node/no-missing-require, node/no-extraneous-require */

module.exports = {
   entry: { server: './server.js' },
   resolve: { extensions: ['.js', '.ts'] },
   target: 'node',
   mode: 'production',
   externals: [/node_modules/], // this makes sure we include node_modules and other 3rd party libraries
   output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js'
   },
   module: {
      rules: [{ test: /\.ts$/, loader: 'ts-loader' }]
   },
   plugins: [new webpack.ContextReplacementPlugin(/(.+)?express(\\|\/)(.+)?/, path.join(__dirname, 'src'), {})],
   stats: {
      colors: true,
      hash: true,
      timings: true,
      chunks: true,
      chunkModules: true,
      children: false,
      modules: false,
      reasons: false,
      warnings: true,
      assets: false,
      version: false
   }
};
