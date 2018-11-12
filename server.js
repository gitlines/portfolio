const path = require('path');
const fs = require('fs');
const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const isHeroku = require('is-heroku');
const sslRedirect = require('heroku-ssl-redirect');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

const PORT = process.env.PORT || 5000; // In Heroku port is assigned with an env variable
const HOST = '0.0.0.0';

const APP_NAME = 'portfolio';
const DIST_FOLDER = fs.existsSync('dist') ? 'dist' : '';
const SERVE_FOLDER = path.resolve(process.cwd(), DIST_FOLDER, APP_NAME); // Path of the compiled app related to /dist

// Serve favicon
app.use(favicon(path.join(SERVE_FOLDER, 'favicon.ico')));

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

// Serve static files
app.use(express.static(SERVE_FOLDER));

// Redirect all calls to index.html
app.get('*', (req, res) => res.sendFile('index.html', { root: SERVE_FOLDER }));

// Run the server
app.listen(PORT, HOST, () => console.log(`App running on port ${PORT}`));
