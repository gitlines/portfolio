import * as express from 'express';
import * as memoryCache from 'memory-cache';

/**
 * Middleware to cache responses.
 *
 * @param {number} [duration=10] Cache duration in seconds
 * @returns {express.RequestHandler}
 */
export function cache(duration: number = 10): express.RequestHandler {
   return function(req: express.Request, res: express.Response, next: express.NextFunction): void {
      const url: string = req.originalUrl || req.url;
      const key: string = '__express__' + url;
      const cachedBody: any = memoryCache.get(key);

      if (cachedBody) {
         console.log(`Serving from cache for ${url}`);
         res.send(cachedBody);
      } else {
         const send: express.Send = res.send;
         res.send = function(body: any) {
            memoryCache.put(key, body, duration * 1000);
            console.log(`Cache saved for ${url}`);
            return send.call(this, body);
         };
         next();
      }
   };
}
