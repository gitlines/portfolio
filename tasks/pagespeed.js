const Promise = require('bluebird');
const gulp = require('gulp');
const chalk = require('chalk');
const argv = require('yargs').argv;
const psi = require('psi');
const github = require('../lib/github');

gulp.task('pagespeed', (done) => {

  // Get task parameters
  const url = argv.url;
  const treshold = Math.min(Math.max(parseInt(argv.treshold), 0), 100);

  // Validate url
  const validUrl = /^http(s)?:\/\//;

  if (!url || !validUrl.test(url)) {
    const msg = 'PageSpeed task needs to be called with a valid --url.';
    console.error(chalk.bold.red(msg));
    return Promise.reject(new Error(msg));
  }

  // PageSpeed API options
  const mobileOptions = { nokey: true, strategy: 'mobile', threshold: 0 };
  const desktopOptions = { nokey: true, strategy: 'desktop', threshold: 0 };

  console.log(chalk.green(`Launching PageSpeed Insights audit for url: ${url}`));

  // Get the PageSpeed Insights report
  let mobileResult = {};
  let desktopResult = {};

  Promise.all([psi.output(url, mobileOptions), psi.output(url, desktopOptions)]) // Console report

    // JSON results
    .then(() => Promise.all([psi(url, mobileOptions), psi(url, desktopOptions)]))

    // Save results
    .then((psiResults) => {
      [mobileResult, desktopResult] = psiResults;
    })

    // Post comment to GitHub with audit results
    .then(() => {

      // Skip comment if not in Travis CI or not a push event
      if (!process.env.TRAVIS || process.env.TRAVIS_EVENT_TYPE !== 'push') {
        return;
      }

      const title = 'PageSpeed Insights';
      const reportUrl = `https://developers.google.com/speed/pagespeed/insights/?url=${encodeURI(url)}`;
      const logoUrl = 'https://www.gstatic.com/images/icons/material/product/2x/pagespeed_64dp.png';
      const body = `<img src="${logoUrl}" height="80px">\n\n` +
        `Report at [${reportUrl}](${reportUrl})\n\n` +
        `* Mobile Speed: ${mobileResult.ruleGroups.SPEED.score}%\n` +
        `* Desktop Speed: ${desktopResult.ruleGroups.SPEED.score}%`;

      return github.comment(title, body);
    })

    // Check treshold
    .then(() => {

      const failedTresholdMobile = treshold && mobileResult.ruleGroups.SPEED.score < treshold;
      const failedTresholdDesktop = treshold && desktopResult.ruleGroups.SPEED.score < treshold;

      if (failedTresholdMobile || failedTresholdDesktop) {
        return Promise.reject(new Error(
          `PageSpeed Insights treshold ${treshold}% not met ` +
          `with mobile score ${mobileResult.ruleGroups.SPEED.score}% and ` +
          `desktop score ${desktopResult.ruleGroups.SPEED.score}%.`
        ));
      }

      done();
    })

    // Print errors to the console and fail
    .catch((err) => {
      console.error(chalk.bold.red(err));
      done(e);
      throw e; // Throw to exit process with status 1.
    });
});
