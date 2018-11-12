const path = require('path');
const gulp = require('gulp');
const { applications } = require('../lib/angular');

const tasks = applications.map((app) => {
   const indexPath = path.resolve(app.outputPath, 'index.html');
   const taskName = `optimize:html:${app.name}`;

   gulp.task(taskName, (cb) => {
      console.log(indexPath);
      cb();
   });

   return taskName;
});

gulp.task('optimize:html', gulp.parallel(...tasks));
