const path = require('path');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const { applications } = require('../lib/angular');

const imagesTask = (app) => `optimize:images:${app.name}`;

// Minify and optimize images.
applications.forEach((app) => {
   const assets = path.join(app.outputPath, 'assets', '*.{png,jpg,jpeg,svg,gif}');

   gulp.task(imagesTask(app), () =>
      gulp
         .src(assets, { base: './' })
         .pipe(
            imagemin(
               [
                  imageminMozjpeg({ progressive: true, quality: 85 }),
                  imagemin.gifsicle({ interlaced: true }),
                  imagemin.optipng({ optimizationLevel: 5 }),
                  imagemin.svgo({
                     plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
                  })
               ],
               { verbose: true }
            )
         )
         .pipe(gulp.dest('./'))
   );
});

const tasks = applications.map((app) => imagesTask(app));
gulp.task('optimize:images', gulp.parallel(...tasks));
