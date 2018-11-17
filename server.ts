import { enableProdMode } from '@angular/core';
import { renderModuleFactory } from '@angular/platform-server';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import * as compression from 'compression';
import * as express from 'express';
import { existsSync, readFileSync } from 'fs';
import * as helmet from 'helmet';
import * as sslRedirect from 'heroku-ssl-redirect';
import * as isHeroku from 'is-heroku';
import * as morgan from 'morgan';
import { join, resolve } from 'path';
import 'reflect-metadata';
import * as favicon from 'serve-favicon';
import 'zone.js/dist/zone-node';
import { cache } from './server/cache';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = parseInt(process.env.PORT) || 5000; // In Heroku port is assigned with an env variable
const HOST = '0.0.0.0';

const APP_NAME = 'portfolio';
const DIST_FOLDER = existsSync('dist') ? 'dist' : '';
const SERVE_FOLDER = resolve(process.cwd(), DIST_FOLDER, APP_NAME); // Path of the compiled app related to /dist

// Serve favicon
app.use(favicon(join(SERVE_FOLDER, 'favicon.ico')));

// Log requests
app.use(morgan('dev'));

// Redirect to https if running in production
if (isHeroku) {
   app.use(sslRedirect());
}

// Secure app
app.use(
   helmet({
      crossdomain: true,
      referrerPolicy: { policy: 'same-origin' }
   })
);

// GZIP all assets
app.use(compression());

// Leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/portfolio-server/main');

// Use template index.html since it has been optimized
const template = readFileSync(join(SERVE_FOLDER, 'index.html')).toString();

app.engine('html', (_, options, callback) => {
   renderModuleFactory(AppServerModuleNgFactory, {
      document: template,
      url: options.req.url,
      extraProviders: [provideModuleMap(LAZY_MODULE_MAP)]
   }).then((html) => {
      callback(null, html);
   });
});

app.set('view engine', 'html');
app.set('views', SERVE_FOLDER);

// Implement data requests securely
app.get('/api/*', (req, res) => {
   res.status(404).send('API requests are not supported');
});

// Server static files from /browser
app.get('*.*', express.static(SERVE_FOLDER));

// All regular routes use the Universal engine, cached for 1h
app.get('*', cache(3600), (req, res) => {
   res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, HOST, () => console.log(`App running on http://localhost:${PORT}`));
