const path = require('path');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000; // In Heroku port is assigned with an env variable
const DIST_FOLDER = path.join(__dirname, 'dist/portfolio'); // Path of the compiled app
const INDEX = path.join(DIST_FOLDER, 'index.html'); // Path of the compiled app

app.use(express.static(DIST_FOLDER)); // Serve static files

app.get('*', (req, res) => res.sendFile(INDEX)); // Redirect all calls to index.html

app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // Run the server
