const path = require('path');
const webpack = require('webpack');

module.exports = {
   entry: { server: './server.js' },
   resolve: { extensions: ['.js', '.ts'] },
   target: 'node',
   mode: 'none',
   externals: [/node_modules/], // this makes sure we include node_modules and other 3rd party libraries
   output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js'
   },
   module: {
      rules: [{ test: /\.ts$/, loader: 'ts-loader' }]
   },
   plugins: [new webpack.ContextReplacementPlugin(/(.+)?express(\\|\/)(.+)?/, path.join(__dirname, 'src'), {})]
};
