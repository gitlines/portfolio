import { SubscriptionServerOptions } from 'apollo-server-core';
import { ApolloServer, Config } from 'apollo-server-express';
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

import { connectMongo, resolvers, typeDefs } from './db';
import { cache, CacheConfig, CacheControl, ga, GoogleAnalytics, GoogleAnalyticsConfig } from './middleware';

console.clear();
require('dotenv').config(); // Load .env

class Server {
   static PORT = parseInt(process.env.PORT) || 5000; // In Heroku port is assigned with an env variable
   static HOST = '0.0.0.0';
   static LOCALHOST = `http://localhost:${Server.PORT}`;

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
   static GRAPHQL_CONFIG: Partial<Config> = {
      introspection: true,
      playground: true,
      engine: {
         apiKey: process.env.ENGINE_API_KEY,
      },
      subscriptions: {
         keepAlive: 10,
      },
   };
   static GRAPHQL_PATH = '/graphql';

   private app: express.Application;
   private httpServer: http.Server;
   private graphqlServer: ApolloServer;
   private BROWSER_FOLDER: string;
   private htmlEngine: Function;
   private ssrRender: express.RequestHandler;

   constructor() {
      console.log(`Environment set to ${process.env.NODE_ENV}`);
      this.app = express();
   }

   private loadUniversal() {
      // Compiled Angular Universal module at run time
      const { BROWSER_FOLDER, htmlEngine, ssrRender } = require('./universal');
      this.BROWSER_FOLDER = BROWSER_FOLDER;
      this.htmlEngine = htmlEngine(Server.PORT);
      this.ssrRender = ssrRender;
   }

   private favicon() {
      this.app.use(favicon(join(this.BROWSER_FOLDER, 'favicon.ico')));
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
      // Configure whitelist differently depending if in production or development
      let whitelist: string[] = process.env.NODE_ENV === 'production' ? [process.env.HOST] : Server.CORS_WHITELIST;
      whitelist = whitelist.filter((host) => !!host).map((host) => host.replace(/\/$/, '')); // Remove trailing "/"

      const corsOptions: cors.CorsOptions = {
         origin: (origin, callback) => {
            if (whitelist.indexOf(origin) !== -1 || !origin) {
               callback(null, true);
            } else {
               callback(new Error(`Origin ${origin} not allowed by CORS, allowed origins ${whitelist.join(', ')}`));
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
      this.app.get('*.*', express.static(this.BROWSER_FOLDER));
   }

   private async graphql() {
      try {
         await connectMongo(); // Connect to the MongoDB

         this.graphqlServer = new ApolloServer({
            ...Server.GRAPHQL_CONFIG,
            typeDefs,
            resolvers,
            subscriptions: {
               ...(<Partial<SubscriptionServerOptions>>Server.GRAPHQL_CONFIG.subscriptions),
               onConnect: (_, webSocket) => {
                  console.log(chalk.yellow(`WebSockets client connected from ${webSocket.url}`));
               },
               onDisconnect: (webSocket) => {
                  console.log(chalk.red(`WebSockets client disconnected from ${webSocket.url}`));
               },
            },
         });
         this.graphqlServer.applyMiddleware({ app: this.app, path: Server.GRAPHQL_PATH }); // Connect GraphQl
      } catch (e) {
         // If it fails return always 404
         this.app.use(Server.GRAPHQL_PATH, (req, res) => res.status(404).end());
         this.graphqlServer = undefined;
      }
   }

   private universal() {
      this.app.engine('html', this.htmlEngine);
      this.app.set('view engine', 'html');
      this.app.set('views', this.BROWSER_FOLDER);
      const googleAnalytics: express.RequestHandler = ga(Server.GOOGLE_ANALYTICS_CONFIG);
      const cacheHandler: express.RequestHandler = cache(Server.CACHE_CONFIG);
      this.app.get('*', googleAnalytics, cacheHandler, this.ssrRender);
   }

   private createServer() {
      this.httpServer = http.createServer(this.app);
   }

   private graphqlSubscriptions() {
      if (this.graphqlServer) {
         this.graphqlServer.installSubscriptionHandlers(this.httpServer);
      }
   }

   private startServer() {
      return new Promise((resolve) => {
         this.httpServer
            .listen(Server.PORT, Server.HOST, () => {
               console.log(chalk.green(`App running on ${Server.LOCALHOST}`));

               if (this.graphqlServer) {
                  const graphqlPath: string = this.graphqlServer.graphqlPath;
                  const subscriptionsPath: string = this.graphqlServer.subscriptionsPath;
                  console.log(chalk.green(`GraphQL running on ${Server.LOCALHOST}${graphqlPath}`));
                  console.log(chalk.green(`Subscriptions ready at ws://localhost:${Server.PORT}${subscriptionsPath}`));
               }

               resolve();
            })
            .on('error', (err) => {
               console.error(chalk.red(err.message));
               process.exit(1);
            });
      });
   }

   private initialRequest() {
      request(Server.LOCALHOST);
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
      await this.graphql();
      this.universal();
      this.createServer();
      this.graphqlSubscriptions();
      await this.startServer();
      this.initialRequest();
   }
}

const server = new Server();
server.start().catch((err) => {
   console.error(chalk.red(err));
   process.exit(1);
});
