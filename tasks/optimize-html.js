const path = require('path');
const gulp = require('gulp');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const inline = require('gulp-inline-source');
const postcss = require('gulp-html-postcss');
const cssnano = require('cssnano');
const { applications } = require('../lib/angular');

/**
 * To optimize the delivery of an Angular app, this modifications are applied to minimize the load time:
 *    - Inline runtime script
 *    - Move main and polyfill scripts to head and mark them as defer. This makes that they are fetched earlier.
 *
 * This minimizes the critical request depth.
 */
const processScripts = ($) => {
   $('script[type="text/javascript"]').each((index, element) => {
      const script = $(element);
      const src = script.attr('src');

      if (/(runtime)\..*\.js/.test(src)) {
         script.attr('inline', '');
      }

      if (/(main|polyfills)\..*\.js/.test(src)) {
         script.attr('defer', '');
         $('head').append(script); // Move into head
      }
   });
};

const htmlTask = (app) => `optimize:html:${app.name}`;

// Optimize task for index.html
applications.forEach((app) => {
   const index = path.resolve(app.outputPath, 'index.html');

   gulp.task(htmlTask(app), () =>
      gulp
         .src(index, { base: './' })
         .pipe(postcss([cssnano({ preset: 'advanced' })])) // Minify inlined CSS
         .pipe(cheerio(processScripts)) // Mark scripts to be inlined
         .pipe(replace('inline=""', 'inline'))
         .pipe(inline())
         .pipe(gulp.dest('./'))
   );
});

const tasks = applications.map((app) => htmlTask(app));
gulp.task('optimize:html', gulp.parallel(...tasks));
