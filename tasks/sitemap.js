const Promise = require('bluebird');
const path = require('path');
const gulp = require('gulp');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const { argv } = require('yargs');
const SitemapGenerator = require('sitemap-generator');

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
         lastMod: true
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
   const { server, url, host, outputPath } = argv;
   const sitemap = path.resolve(process.cwd(), outputPath, 'sitemap.xml');
   const robots = path.resolve(process.cwd(), outputPath, 'robots.txt');
   let nodeServer;

   try {
      // Run server and generate sitemap.xml
      nodeServer = await runServer(server);
      await generate(url, sitemap);
      nodeServer.kill();

      // Replace localhost by real host
      let sitemapContent = (await fs.readFile(sitemap)).toString();
      sitemapContent = sitemapContent.split(url).join(host);
      await fs.writeFile(sitemap, sitemapContent);

      // Update robots.txt if needed
      if (await fs.pathExists(robots)) {
         let robotsContent = (await fs.readFile(robots)).toString();
         if (robotsContent.indexOf('Sitemap') === -1) {
            robotsContent = `${robotsContent}\nSitemap: ${host}sitemap.xml`;
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
