const Promise = require('bluebird');
const gulp = require('gulp');
const chalk = require('chalk');
const argv = require('yargs').argv;
const lighthousePrinter = require('lighthouse/lighthouse-cli/printer');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const comment = require('../lib/github').comment;

// Lighthouse API options
const performanceAudits = [
  'first-meaningful-paint',
  'first-interactive',
  'consistently-interactive',
  'estimated-input-latency',
  'speed-index-metric'
];

// Helper functions
const getAverageValue = (collection, getValue) => collection
  .map((item) => parseInt(String(getValue(item)).replace(/,/g, '')))
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
  const {
    url,
    output,
    threshold,
    github
  } = argv;
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

      lastResult.reportCategories
        .forEach((reportCategory) => { // Log report
          const categoryId = reportCategory.id;
          const meanScore = getAverageValue(lighthouseResults, (result) => result.reportCategories
            .filter((category) => category.id === categoryId)
            .map((category) => category.score)
          );

          console.log(chalk.yellow(`   ${reportCategory.name}: ${meanScore}%`));

          reportCategory.audits
            .filter(() => reportCategory.id === 'performance')
            .filter((audit) => performanceAudits.includes(audit.id))
            .forEach((audit) => {
              const meanDisplayValue = getAverageValue(lighthouseResults, (result) => result.reportCategories
                .filter((category) => category.id === categoryId)
                .map((category) => category.audits
                  .filter(() => reportCategory.id === 'performance')
                  .filter((category) => audit.id === category.id)
                  .map((category) => category.result.displayValue)
                )
              );

              return console.log(chalk.yellow(
                `      ${audit.result.description}: ${meanDisplayValue}`
              ));
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
      let body = `<img src="${logoUrl}" height="80px">\n\n` +
        `Deployed at [${url}](${url})\n\n` +
        lastResult.reportCategories.map((reportCategory) => {
          const category = `* ${reportCategory.name}: ${parseInt(reportCategory.score)}%`;
          const audits = reportCategory.audits
            .filter(() => reportCategory.id === 'performance')
            .filter((audit) => performanceAudits.indexOf(audit.id) !== -1)
            .map((audit) => `     * ${audit.result.description}: ${audit.result.displayValue}`);

          return [category, ...audits].join('\n');
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
