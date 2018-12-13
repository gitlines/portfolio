require('dotenv').config();

const path = require('path');
/* eslint-disable node/no-missing-require, node/no-extraneous-require */
const webpack = require('webpack'); // We use the webpack installed by angular devkit
/* eslint-enable node/no-missing-require, node/no-extraneous-require */
const nodeExternals = require('webpack-node-externals');

module.exports = {
   entry: {
      server: path.resolve(__dirname, './express-server.ts'),
   },
   resolve: {
      extensions: ['.js', '.ts'],
   },
   target: 'node',
   mode: 'production', // Resolves process.env.NODE_ENV to production when building
   output: {
      path: path.join(process.cwd(), 'dist'),
      filename: '[name].js',
   },
   externals: [nodeExternals(), /(node_modules|main\..*\.js)/],
   module: {
      rules: [
         {
            test: /\.ts$/,
            loader: 'ts-loader',
            options: {
               configFile: path.resolve(__dirname, './tsconfig.json'),
            },
         },
      ],
   },
   plugins: [
      // Temporary Fix for issue: https://github.com/angular/angular/issues/11580
      // for 'WARNING Critical dependency: the request of a dependency is an expression'
      new webpack.ContextReplacementPlugin(/(.+)?angular(\\|\/)core(.+)?/, path.join(process.cwd(), 'src'), {}),
      new webpack.ContextReplacementPlugin(/(.+)?express(\\|\/)(.+)?/, path.join(process.cwd(), 'src'), {}),
   ],
   watchOptions: {
      ignored: /node_modules/,
   },
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
      version: false,
   },
};
