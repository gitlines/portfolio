console.clear();
require('dotenv').config(); // Load .env

import chalk from 'chalk';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as sslRedirect from 'heroku-ssl-redirect';
import * as http from 'http';
import * as isHeroku from 'is-heroku';
import * as morgan from 'morgan';
import { join } from 'path';
import * as request from 'request';
import * as favicon from 'serve-favicon';
import { cache, CacheConfig, CacheControl, ga, GoogleAnalytics, GoogleAnalyticsConfig } from './middleware';

class Server {
   static PORT = parseInt(process.env.PORT) || 5000; // In Heroku port is assigned with an env variable
   static HOST = '0.0.0.0';

   static HELMET_OPTIONS: helmet.IHelmetConfiguration = {
      permittedCrossDomainPolicies: true,
      referrerPolicy: { policy: 'same-origin' },
   };
   static CORS_WHITELIST: string[] = ['http://localhost:5000', 'http://localhost:5100'];
   static GOOGLE_ANALYTICS_CONFIG: GoogleAnalyticsConfig = { type: GoogleAnalytics.TagManager };
   static CACHE_CONFIG: CacheConfig[] = [
      { path: '/users', type: CacheControl.NO_CACHE },
      { path: '*', type: CacheControl.PUBLIC, duration: 3600 },
   ];

   private app: express.Application;
   private BROWSER_FOLDER: string;
   private htmlEngine: Function;
   private ssrRender: express.RequestHandler;

   constructor() {
      this.app = express();
      // Allow more connections
      http.globalAgent.maxSockets = 100;
   }

   private loadUniversal() {
      try {
         // Compiled Angular Universal module at run time
         const { BROWSER_FOLDER, htmlEngine, ssrRender } = require('./universal');
         this.BROWSER_FOLDER = BROWSER_FOLDER;
         this.htmlEngine = htmlEngine;
         this.ssrRender = ssrRender;
      } catch (e) {}
   }

   private favicon() {
      if (this.BROWSER_FOLDER) {
         this.app.use(favicon(join(this.BROWSER_FOLDER, 'favicon.ico')));
      }
   }

   private log() {
      this.app.use(morgan(':method :url :status :response-time ms :res[content-length] :referrer :user-agent'));
   }

   private httpsRedirect() {
      if (isHeroku) {
         this.app.use(sslRedirect());
      }
   }

   private secure() {
      this.app.use(helmet(Server.HELMET_OPTIONS));
   }

   private cors() {
      const corsOptions: cors.CorsOptions = {
         origin: (origin, callback) => {
            if (Server.CORS_WHITELIST.indexOf(origin) !== -1 || !origin) {
               callback(null, true);
            } else {
               callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
         },
      };
      this.app.use('*', cors(corsOptions));
   }

   private gzip() {
      this.app.use(compression());
   }

   private cookieParser() {
      this.app.use(cookieParser());
   }

   private static() {
      if (this.BROWSER_FOLDER) {
         this.app.get('*.*', express.static(this.BROWSER_FOLDER));
      }
   }

   private universal() {
      if (this.BROWSER_FOLDER) {
         this.app.engine('html', this.htmlEngine);
         this.app.set('view engine', 'html');
         this.app.set('views', this.BROWSER_FOLDER);
         const googleAnalytics: express.RequestHandler = ga(Server.GOOGLE_ANALYTICS_CONFIG);
         const cacheHandler: express.RequestHandler = cache(Server.CACHE_CONFIG);
         this.app.get('*', googleAnalytics, cacheHandler, this.ssrRender);
      } else {
         this.app.use('*', (req, res) => res.status(404).end());
      }
   }

   private serve() {
      return new Promise((resolve) => {
         this.app
            .listen(Server.PORT, Server.HOST, () => {
               console.log(chalk.green(`App running on http://localhost:${Server.PORT}/`));
               resolve();
            })
            .on('error', () => process.exit(1));
      });
   }

   private initialRequest() {
      request(`http://localhost:${Server.PORT}/`);
   }

   async start() {
      this.loadUniversal();
      this.favicon();
      this.log();
      this.httpsRedirect();
      this.secure();
      this.cors();
      this.gzip();
      this.cookieParser();
      this.static();
      this.universal();
      await this.serve();
      this.initialRequest();
   }
}

const server = new Server();
server.start().catch(() => process.exit(1));
