const Promise = require('bluebird');
const gulp = require('gulp');
const chalk = require('chalk');
const argv = require('yargs').argv;
// const lighthousePrinter = require('lighthouse/lighthouse-cli/printer');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const comment = require('../lib/github').comment;

// Lighthouse categories
const categories = ['performance', 'pwa', 'accessibility', 'best-practices', 'seo'];

// Lighthouse key audits
const performanceAudits = [
  'first-meaningful-paint',
  'first-cpu-idle',
  'interactive',
  'estimated-input-latency',
  'speed-index'
];

// Helper functions
const getAverageValue = (collection, getValue) => collection
  .map((item) => getValue(item))
  .reduce((average, value) => average + value / collection.length, 0)
  .toFixed();

// Method to run Lighthouse audits
const launchChromeAndRunLighthouse = (url) => {
  return chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox']
    })
    .then(chrome => {
      console.log('   Chrome launched, starting audit...');
      console.time('   Lighthouse audit finished in');
      const flags = {
        port: chrome.port
      };
      return lighthouse(url, flags, null).then(results => {
        console.timeEnd('   Lighthouse audit finished in');
        console.log();
        return chrome.kill().then(() => results).catch(() => results);
      });
    });
};


gulp.task('lighthouse', function () {

  // Get task parameters
  const { url, threshold, github } = argv;
  const runs = Math.min(Math.max(Number(argv.runs) || 1, 1), 5);

  // Validate url
  const validUrl = /^http(s)?:\/\//;

  if (!url || !validUrl.test(url)) {
    const msg = 'Lighthouse task needs to be called with a valid --url.';
    console.error(chalk.bold.red(msg));
    return Promise.reject(new Error(msg));
  }

  console.log(chalk.green(`Launching Lighthouse audit for url: ${url}`));

  // Get the Lighthouse report

  return Promise.mapSeries(
      Array.from(Array(runs)), // Iterate over the number of runs...
      () => launchChromeAndRunLighthouse(argv.url) // ...generating audits in sequence
    )

    // Get the Lighthouse results
    .then((lighthouseResults) => {

      console.log(chalk.green('Audit finished with the following results:'));

      const lastResult = lighthouseResults[lighthouseResults.length - 1];

      categories
        .map((category) => lastResult.lhr.categories[category])
        .forEach((category) => { // Log report
          const meanScore = getAverageValue(lighthouseResults, (result) => result.lhr.categories[category.id].score * 100);
          console.log(chalk.yellow(`   ${category.title}: ${meanScore}%`));

          // Calculate mean results for performance audits
          if (category.id !== 'performance') {
            return;
          }

          performanceAudits
            .map((audit) => lastResult.lhr.audits[audit])
            .forEach((audit) => {
              const meanRawValue = getAverageValue(lighthouseResults, (result) => result.lhr.audits[audit.id].rawValue);
              return console.log(chalk.yellow(`      ${audit.title}: ${meanRawValue} ms`));
            });
        });

      return lastResult;
    })

    // Post comment to GitHub with audit results
    .then((lastResult) => {

      // Skip comment if parameter not passed
      if (!github) {
        return lastResult;
      }

      const title = 'Lighthouse Audit';
      const logoUrl = 'https://github.com/GoogleChrome/lighthouse/raw/master/assets/crx/lighthouse-small.jpg';
      let body = `<img src="${logoUrl}" height="80px">\n\nDeployed at [${url}](${url})\n\n`;

      body += categories
        .map((category) => lastResult.lhr.categories[category])
        .map((category) => {
          const categoryBody = `* ${category.title}: ${parseInt(category.score * 100)}%`;

          const auditsBody = category.id !== 'performance' ? [] : performanceAudits
            .map((audit) => lastResult.lhr.audits[audit])
            .map((audit) => `  * ${audit.title}: ${parseInt(audit.rawValue)} ms`);

          return [categoryBody, ...auditsBody].join('\n');
        }).join('\n');

      if (threshold) {
        if (lastResult.score < threshold) {
          body += "\n\n```diff\n--- Audit failed with score < " + threshold + "%\n```";
        } else {
          body += "\n\n```diff\n+++ Audit succeeded with score > " + threshold + "%\n```";
        }
      }

      return comment(title, body).then(() => lastResult);
    })

    // Check threshold
    .then((lastResult) => {

      if (threshold && lastResult.score < threshold) {
        return Promise.reject(new Error(
          `Lighthouse audit failed with score ${parseInt(lastResult.score)}% (<${parseInt(threshold)}%).`
        ));
      }

    });

});
