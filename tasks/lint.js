const gulp = require('gulp');
const run = require('gulp-run-command').default;

gulp.task('lint:js', run('eslint . --ignore-path .gitignore'));
gulp.task('lint:scss', run('stylelint "src/**/*.scss" --ignore-path .gitignore'));
gulp.task('lint:ts:angular', run('ng lint'));
gulp.task('lint:ts:server', run('tslint --config tslint.json --project tsconfig.json **/*.ts'));
gulp.task('lint:html', run('htmllint "src/**/*.html"'));

gulp.task('lint', gulp.parallel('lint:js', 'lint:scss', 'lint:ts:angular', 'lint:ts:server', 'lint:html'));
