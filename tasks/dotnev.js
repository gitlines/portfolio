const path = require('path');
const fs = require('fs-extra');
const gulp = require('gulp');
const { argv } = require('yargs');
const dotenv = require('dotenv');

gulp.task('dotenv', async () => {
   const exampleFilename = '.env.example';
   const example = path.resolve(process.cwd(), exampleFilename);
   const exampleVars = dotenv.parse(await fs.readFile(example));
   const inputVars = Object.assign({}, process.env, argv);

   let output = '';

   Object.keys(exampleVars).forEach((key) => {
      if (inputVars[key]) {
         output += `${key}=${inputVars[key]}\n`;
         console.log(`Adding variable ${key} to .env`);
      } else {
         throw new Error(
            `Variable ${key} was defined in ${exampleFilename} but is not present in the environment.` +
               `\nMake sure to add it to the environment or pass it as a parameter with --VAR=VALUE`
         );
      }
   });

   await fs.writeFile('.env', output);
});
