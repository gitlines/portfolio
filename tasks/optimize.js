const gulp = require('gulp');
const run = require('gulp-run-command').default;

// After running the optimizations, the assets have changed, so we need to update the service worker metadata
gulp.task('optimize:ngsw', run('ngsw-config dist/portfolio ngsw-config.json'));

const tasks = gulp.series('optimize:critical', 'optimize:css', 'optimize:html', 'optimize:images', 'optimize:ngsw');
gulp.task('optimize', tasks);
