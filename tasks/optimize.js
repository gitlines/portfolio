const gulp = require('gulp');

gulp.task('optimize', gulp.series('optimize:critical', 'optimize:css', 'optimize:html', 'optimize:images'));
