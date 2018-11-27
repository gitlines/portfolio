const Promise = require('bluebird');
const path = require('path');
const gulp = require('gulp');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const yargs = require('yargs');
const SitemapGenerator = require('sitemap-generator');

require('dotenv').config();

const runServer = (server) =>
   new Promise((resolve, reject) => {
      const nodeServer = spawn('node', [server]);

      nodeServer.stdout.on('data', (data) => {
         console.log(data.toString().replace(/\r?\n|\r/g, ''));
         resolve(nodeServer);
      });

      nodeServer.stderr.on('data', () => {
         nodeServer.kill(1);
      });

      nodeServer.stdout.on('close', () => {
         reject('Server failed.');
      });
   });

const generate = (url, sitemap) =>
   new Promise((resolve, reject) => {
      const generator = SitemapGenerator(url, {
         stripQuerystring: false,
         filepath: sitemap,
         changeFreq: 'weekly',
         lastMod: true,
      });

      generator.on('done', () => {
         resolve();
      });

      generator.on('error', (error) => {
         reject(error);
      });

      generator.start();
   });

gulp.task('sitemap', async () => {
   const argv = yargs
      .env()
      .usage('Usage: gulp sitemap [options]')
      .describe('server', 'Path to the JS script that will load the server')
      .describe('localUrl', 'Url of the local server')
      .describe('url', 'The url of the host of sitemap.xml to be used in it')
      .describe('outputPath', 'Folder to output sitemap.xml')
      .demandOption(['server', 'localUrl', 'outputPath']).argv;

   const { server, localUrl, url, outputPath } = argv;
   const sitemap = path.resolve(process.cwd(), outputPath, 'sitemap.xml');
   const robots = path.resolve(process.cwd(), outputPath, 'robots.txt');
   let nodeServer;

   try {
      // Run server and generate sitemap.xml
      nodeServer = await runServer(server);
      await generate(localUrl, sitemap);
      nodeServer.kill();

      // Replace localhost by real host if provided
      if (url) {
         let sitemapContent = (await fs.readFile(sitemap)).toString();
         sitemapContent = sitemapContent.split(localUrl).join(url);
         await fs.writeFile(sitemap, sitemapContent);
      }

      // Update robots.txt if needed
      if (await fs.pathExists(robots)) {
         let robotsContent = (await fs.readFile(robots)).toString();
         if (robotsContent.indexOf('Sitemap') === -1) {
            robotsContent = `${robotsContent}\nSitemap: ${url}sitemap.xml`;
            await fs.writeFile(robots, robotsContent);
         }
      }
   } catch (error) {
      console.error(error);

      if (nodeServer) {
         nodeServer.kill();
      }
   }
});
