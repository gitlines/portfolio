const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000; // In Heroku port is assigned with an env variable
const HOST = '0.0.0.0';

const APP_NAME = 'portfolio';
const DIST_FOLDER = fs.existsSync('dist') ? 'dist' : '';
const SERVE_FOLDER = path.resolve(process.cwd(), DIST_FOLDER, APP_NAME); // Path of the compiled app related to /dist

app.use(express.static(SERVE_FOLDER)); // Serve static files

app.get('*', (req, res) => res.sendFile('index.html', { root: SERVE_FOLDER })); // Redirect all calls to index.html

app.listen(PORT, HOST, () => console.log(`Listening on port ${PORT}`)); // Run the server
