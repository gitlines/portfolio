require('reflect-metadata');
require('zone.js/dist/zone-node');

import { enableProdMode } from '@angular/core';
import { renderModuleFactory } from '@angular/platform-server';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import * as express from 'express';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

export const DIST_FOLDER = existsSync('dist') ? 'dist' : '';
export const BROWSER_FOLDER = resolve(process.cwd(), DIST_FOLDER, 'browser'); // Path of the compiled app at run time

// Leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../dist/server/main'); // Path at build time

// Use template index.html since it has been optimized
const template: string = readFileSync(join(BROWSER_FOLDER, 'index.html')).toString();

export const htmlEngine: Function = (_, options, callback) => {
   renderModuleFactory(AppServerModuleNgFactory, {
      document: template,
      url: options.req.url,
      extraProviders: [provideModuleMap(LAZY_MODULE_MAP)],
   })
      .then((html) => callback(null, html))
      .catch((err) => callback(err));
};

export const ssrRender: express.RequestHandler = (req: express.Request, res: express.Response) => {
   res.render('index', { req }, (err: Error, body: string) => {
      if (err) {
         res.status(500).end();
         console.log(err);
      } else {
         res.send(body);
      }
   });
};
