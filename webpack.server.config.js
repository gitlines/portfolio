const path = require('path');
const webpack = require('webpack');

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
