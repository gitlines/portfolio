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
  const treshold = Math.min(Math.max(parseInt(argv.treshold), 0), 100);

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

    // Process results results
    .then((psiResults) => {

      const [mobileResult, desktopResult] = psiResults;

      mobileResult.failedTreshold = treshold && mobileResult.ruleGroups.SPEED.score < treshold;
      desktopResult.failedTreshold = treshold && desktopResult.ruleGroups.SPEED.score < treshold;

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

      if (treshold) {
         if (mobileResult.failedTreshold || desktopResult.failedTreshold) {
            body += "```diff\n---Audit failed with score <" + treshold + "%\n```";
         } else {
            body += "```diff\n+++Audit succeeded with score >" + treshold + "%\n```";
         }
      }

      return comment(title, body).then(() => [mobileResult, desktopResult]);
    })

    // Check treshold
    .then(([mobileResult, desktopResult]) => {

      if (mobileResult.failedTreshold || desktopResult.failedTreshold) {
        return Promise.reject(new Error(
          `PageSpeed Insights treshold ${treshold}% not met ` +
          `with mobile score ${mobileResult.ruleGroups.SPEED.score}% and ` +
          `desktop score ${desktopResult.ruleGroups.SPEED.score}%.`
        ));
      }

    });
});
