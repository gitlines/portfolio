import chalk from 'chalk';
import * as express from 'express';
import * as memCache from 'memory-cache';

/**
 * Middleware to cache responses.
 *
 * @param {number} [duration=10] Cache duration in seconds
 * @returns {express.RequestHandler}
 */
export function cache(duration: number = 10): express.RequestHandler {
   function memoryCache(req: express.Request, res: express.Response, next: express.NextFunction): void {
      const url: string = req.originalUrl || req.url;
      const key: string = '__express__' + url;
      const cachedBody: any = memCache.get(key);

      if (cachedBody) {
         console.log(chalk.gray(`Serving from cache for ${url}`));
         res.send(cachedBody);
      } else {
         const send: express.Send = res.send;
         res.send = function(body: any) {
            memCache.put(key, body, duration * 1000);
            console.log(chalk.greenBright(`Cache saved for ${url}`));
            return send.call(this, body);
         };
         next();
      }
   }
   return memoryCache;
}
