const Promise = require('bluebird');
const gulp = require('gulp');
const chalk = require('chalk');
const argv = require('yargs').argv;
const psi = require('psi');
const comment = require('../lib/github').comment;

// PageSpeed API options
const mobileOptions = {
  nokey: true,
  strategy: 'mobile',
  threshold: 0
};
const desktopOptions = {
  nokey: true,
  strategy: 'desktop',
  threshold: 0
};


gulp.task('pagespeed', () => {

  // Get task parameters
  const url = argv.url;
  const github = argv.github;
  const threshold = Math.min(Math.max(parseInt(argv.threshold), 0), 100);

  // Validate url
  const validUrl = /^http(s)?:\/\//;

  if (!url || !validUrl.test(url)) {
    const msg = 'PageSpeed task needs to be called with a valid --url.';
    console.error(chalk.bold.red(msg));
    return Promise.reject(new Error(msg));
  }

  console.log(chalk.green(`Launching PageSpeed Insights audit for url: ${url}`));

  // Get the PageSpeed Insights report

  return Promise.all([psi.output(url, mobileOptions), psi.output(url, desktopOptions)]) // Console report

    // JSON results
    .then(() => Promise.all([psi(url, mobileOptions), psi(url, desktopOptions)]))

    // Process results
    .then((psiResults) => {

      const [mobileResult, desktopResult] = psiResults;

      mobileResult.failedThreshold = threshold && mobileResult.ruleGroups.SPEED.score < threshold;
      desktopResult.failedThreshold = threshold && desktopResult.ruleGroups.SPEED.score < threshold;

      return [mobileResult, desktopResult];
    })

    // Post comment to GitHub with audit results
    .then(([mobileResult, desktopResult]) => {

      // Skip comment if parameter not passed
      if (!github) {
        return [mobileResult, desktopResult];
      }

      const title = 'PageSpeed Insights';
      const reportUrl = `https://developers.google.com/speed/pagespeed/insights/?url=${encodeURI(url)}`;
      const logoUrl = 'https://www.gstatic.com/images/icons/material/product/2x/pagespeed_64dp.png';
      let body = `<img src="${logoUrl}" height="80px">\n\n` +
        `Report at [${reportUrl}](${reportUrl})\n\n` +
        `* Mobile Speed: ${mobileResult.ruleGroups.SPEED.score}%\n` +
        `* Desktop Speed: ${desktopResult.ruleGroups.SPEED.score}%`;

      if (threshold) {
         if (mobileResult.failedThreshold || desktopResult.failedThreshold) {
            body += "\n\n```diff\n--- Audit failed with score < " + threshold + "%\n```";
         } else {
            body += "\n\n```diff\n+++ Audit succeeded with score > " + threshold + "%\n```";
         }
      }

      return comment(title, body).then(() => [mobileResult, desktopResult]);
    })

    // Check threshold
    .then(([mobileResult, desktopResult]) => {

      if (mobileResult.failedThreshold || desktopResult.failedThreshold) {
        return Promise.reject(new Error(
          `PageSpeed Insights threshold ${threshold}% not met ` +
          `with mobile score ${mobileResult.ruleGroups.SPEED.score}% and ` +
          `desktop score ${desktopResult.ruleGroups.SPEED.score}%.`
        ));
      }

    });
});
