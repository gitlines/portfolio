const Promise = require('bluebird');
const gulp = require('gulp');
const chalk = require('chalk');
const argv = require('yargs').argv;
const psi = require('psi');
const github = require('../lib/github');

gulp.task('pagespeed', () => {

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

  console.log(chalk.green(`Launching PageSpeed Insights audit for url: ${url}`));

  // Get the PageSpeed Insights report

  let mobileResult = {};
  let desktopResult = {};

  return Promise.all([psi.output(url, mobileOptions), psi.output(url, desktopOptions)]) // Console report

    // JSON results
    .then(() => Promise.all([psi(url, mobileOptions), psi(url, desktopOptions)]))

    // Save results
    .then((psiResults) => {
      [mobileResult, desktopResult] = psiResults;
    })

    // Post comment to GitHub with audit results
    .then(() => {
      // Skip comment if not in Travis CI or not a push event
      if (!process.env.TRAVIS || !process.env.TRAVIS_EVENT_TYPE === 'push') {
        return;
      }

      return github.updateComment('test', 'test');
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

    })

    // Print errors to the console
    .catch((err) => {
      console.error(chalk.bold.red(err));
      return Promise.reject(err);
    });
});
