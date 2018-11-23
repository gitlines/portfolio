const path = require('path');
const gulp = require('gulp');
const critical = require('critical');
const fs = require('fs-extra');
const cheerio = require('gulp-cheerio');
const { applications } = require('../lib/angular');

// Configuration for critical, with options inline and extract, checking for iPhone and Desktop sizes
const processCritical = (baseDir, src) =>
   critical.generate({
      inline: true,
      extract: true,
      base: baseDir,
      src: src,
      dest: src,
      dimensions: [
         {
            height: 736,
            width: 414,
         },
         {
            height: 1200,
            width: 1920,
         },
      ],
      penthouse: {
         puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
         },
      },
   });

const generateTask = (app) => `optimize:critical:${app.name}:generate`;
const cleanupTask = (app) => `optimize:critical:${app.name}:cleanup`;

// Generate tasks: Uses critical to process critical CSS path.
// It produces as output the generated file and extracted stylesheets
applications.forEach((app) => {
   gulp.task(generateTask(app), () => processCritical(app.outputPath, 'index.html'));
});

// Cleanup task: Replaces the old css files by new ones that don't contain the extracted css
applications.forEach((app) => {
   gulp.task(cleanupTask(app), () => {
      const index = path.resolve(app.outputPath, 'index.html');
      return gulp
         .src(index, { base: './' })
         .pipe(
            cheerio(($) => {
               // Keyed CSS that will be replaced
               const styleReplacements = {};
               const styleMatch = /(styles\..+)\..+(\.css)/;

               // Method to replace the href
               const substituteHref = (index, element) => {
                  const style = $(element);
                  const href = style.attr('href');

                  if (styleMatch.test(href)) {
                     const replaceHref = href.replace(styleMatch, '$1$2');
                     styleReplacements[href] = replaceHref;
                     style.attr('href', replaceHref);
                  }
               };

               // Cleanup tags <link rel="preload" href="styles.*.*.css" as="style"> and <link rel="stylesheet">
               $('link[as="style"]').each(substituteHref);
               $('link[rel="stylesheet"]').each(substituteHref);

               // Rename the css with extracted critical
               for (let href in styleReplacements) {
                  fs.removeSync(path.join(app.outputPath, styleReplacements[href]));
                  fs.renameSync(path.join(app.outputPath, href), path.join(app.outputPath, styleReplacements[href]));
               }
            })
         )
         .pipe(gulp.dest('./'));
   });
});

// Optimize critical task
const tasks = applications.map((app) => gulp.series(generateTask(app), cleanupTask(app)));
gulp.task('optimize:critical', gulp.parallel(...tasks));
