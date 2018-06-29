
if (process.env.TRAVIS) { // Force colors in Travis CI
  require('chalk').level = 2; // 256 colors
  require('chalk').enabled = true;
}

const requireDir = require('require-dir');
requireDir('./tasks'); // Will load all gulp tasks in folder tasks
