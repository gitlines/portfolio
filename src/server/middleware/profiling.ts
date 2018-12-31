import chalk from 'chalk';
import { EventEmitter } from 'events';
import * as express from 'express';

/**
 * Profiling middleware for express, for granular profiling.
 *
 * @example
 * app.use(profiler()); // Profile the whole request. Will return the total execution and connection time for a request.
 * app.use(profiler(morgan())); // Profile a middleware. Will return the execution time for a middleware.
 *
 * @param {express.RequestHandler} [middleware]
 * @returns {express.RequestHandler}
 */
export function profiler(middleware?: express.RequestHandler): express.RequestHandler {
   // Return different handlers depending on the call

   if (middleware && middleware.length === 3) {
      return profileMiddlewareWithNext(middleware);
   } else if (middleware && middleware.length === 2) {
      // Middleware without next param
      return profileMiddlewareWithoutNext(middleware);
   } else {
      // Global profiling middleware
      return profilingMiddleware();
   }
}

/**
 * Patches an express app to add profiling for:
 *  - The total execution time for a request.
 *  - The total connection time for a request.
 *  - The individual execution time for each middleware added with app.use() and app.get().
 *
 * @example
 * const app = express();
 * profileApp(app); // Add this before any other middleware.
 *
 * @param {express.Express} app
 */
export function profileApp(app: express.Express) {
   // Init profiling
   app.use(profilingMiddleware());

   // Patch .use, make it equivalent to app.use(profiler(middleware));
   const use = app.use;
   app.use = function() {
      return use.call(app, profiler.apply(app, arguments));
   };

   // Patch .get, make it equivalent to app.get(path, profiler(middleware), ...)
   const get: express.IRouterMatcher<express.Express> = app.get;
   app.get = function(path, ...handlers) {
      handlers = handlers.map((handler) => profiler.call(app, handler));
      return get.call(app, path, ...handlers);
   };
}

// Event emitters

const profiles = new EventEmitter();

interface ProfileEvent {
   req: express.Request;
   lapse: [number, number];
   name?: string;
}

profiles.on('middleware', ({ req, lapse, name }: ProfileEvent) => {
   console.info(
      chalk.blue(`Middleware: ${name ? name + ' ' : ''}${req.method} ${req.url} ${lapse[0]}s ${lapse[1] / 1000000}ms`)
   );
});

profiles.on('connection', ({ req, lapse }: ProfileEvent) => {
   console.info(chalk.yellow(`Connection: ${req.method} ${req.url} ${lapse[0]}s ${lapse[1] / 1000000}ms`));
});

profiles.on('route', ({ req, lapse }: ProfileEvent) => {
   console.info(chalk.magenta(`Total time: ${req.method} ${req.url} ${lapse[0]}s ${lapse[1] / 1000000}ms`));
   console.info();
});

// Profiling methods

function profileMiddlewareWithNext(middleware: express.RequestHandler) {
   return function(req: express.Request, res: express.Response, next: express.NextFunction): void {
      const start = process.hrtime();

      middleware(req, res, function() {
         profiles.emit('middleware', {
            req,
            lapse: process.hrtime(start),
            name: middleware.name,
         });

         next();
      });
   };
}

function profileMiddlewareWithoutNext(middleware: express.RequestHandler) {
   return function(req: express.Request, res: express.Response): void {
      const start = process.hrtime();

      res.once('finish', () => {
         profiles.emit('middleware', { req, lapse: process.hrtime(start), name: middleware.name });
      });

      return middleware.apply(this, arguments);
   };
}

function profilingMiddleware() {
   return function(req: express.Request, res: express.Response, next: express.NextFunction): void {
      const startRequest = process.hrtime();
      let startTransmision;

      const send: express.Send = res.send;
      res.send = function(body: any) {
         startTransmision = process.hrtime();
         return send.call(this, body);
      };

      res.once('finish', () => {
         setTimeout(() => {
            profiles.emit('connection', { req, lapse: process.hrtime(startTransmision) });
            profiles.emit('route', { req, lapse: process.hrtime(startRequest) });
         }, 0);
      });
      next();
   };
}
