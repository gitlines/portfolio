require('chalk').level = 1;
require('chalk').enabled = true;
const requireDir = require('require-dir');
requireDir('./tasks'); // Will load all gulp tasks in folder tasks
