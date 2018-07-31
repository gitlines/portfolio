const Promise = require('bluebird');
const path = require('path');
const nugget = require('nugget');

const downloadFile = Promise.promisify(nugget);

const download = async (url, file) => {
   const opts = { singleTarget: true, quiet: true, target: path.basename(file), dir: path.dirname(file) };
   const result = await downloadFile(url, opts);

   if (result instanceof Error) {
      throw result;
   }
};

module.exports = download;
