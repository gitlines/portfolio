const { join, resolve } = require('path');
const { cwd } = process;
const { move, remove } = require('fs-extra');
const gulp = require('gulp');
const cypress = require('cypress');
const { merge } = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');

gulp.task('cypress', async () => {
   await remove(resolve(cwd(), 'mochawesome-report')); // remove the report folder
   await remove(resolve(cwd(), 'docs/cucumber')); // remove the report folder

   const { totalFailed } = await cypress.run({ browser: 'chrome' });
   const jsonReport = await merge(); // generate JSON report
   await generator.create(jsonReport);

   await move(resolve(cwd(), 'mochawesome-report'), join(cwd(), 'docs/cucumber'));
   await move(resolve(cwd(), 'docs/cucumber/mochawesome.html'), join(cwd(), 'docs/cucumber/index.html'));

   if (totalFailed > 0) {
      throw new Error(`Cypress: ${totalFailed} tests failed.`);
   }
});
