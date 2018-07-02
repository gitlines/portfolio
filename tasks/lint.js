const gulp = require('gulp');
const run = require('gulp-run-command').default;

gulp.task('lint:js', run('eslint . --ignore-path .gitignore'));
gulp.task('lint:scss', run('stylelint "**/*.scss" --ignore-path .gitignore'));
gulp.task('lint:ts', run('ng lint'));

gulp.task('lint', gulp.parallel('lint:js', 'lint:scss', 'lint:ts'));
