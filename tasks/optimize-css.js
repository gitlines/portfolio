const path = require('path');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const purify = require('gulp-purifycss');
const { applications } = require('../lib/angular');

const cssTask = (app) => `optimize:css:${app.name}`;

// Optimize task for css files. It leaves only css classes present in src files, and minimizes the output.
applications.forEach((app) => {
   const cssPath = path.join(app.outputPath, '*.css');
   const jsPath = path.join(app.outputPath, '*.js');
   const htmlPath = path.join(app.outputPath, '*.html');

   gulp.task(cssTask(app), () =>
      gulp
         .src(cssPath, { base: './' })
         .pipe(
            purify([jsPath, htmlPath], {
               minify: true
            })
         )
         .pipe(postcss([cssnano({ preset: 'advanced' })]))
         .pipe(gulp.dest('./'))
   );
});

const tasks = applications.map((app) => cssTask(app));
gulp.task('optimize:css', gulp.parallel(...tasks));
