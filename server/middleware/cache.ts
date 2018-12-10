import * as express from 'express';
import { PathParams } from 'express-serve-static-core';
import * as memCache from 'memory-cache';
import * as pathToRegexp from 'path-to-regexp';

/**
 * Options for Cache-Control header.
 */
export enum CacheControl {
   PUBLIC = 'public',
   PRIVATE = 'private',
   NO_CACHE = 'no-cache',
}

/**
 * Cache configuration.
 */
export interface CacheConfig {
   /**
    * Path matching.
    * @type {PathParams}
    */
   path: PathParams;
   /**
    * Duration in seconds.
    * @type {number}
    */
   duration?: number;
   /**
    * Cache type.
    * @type {CacheControl}
    */
   type: CacheControl;
}

interface CachedResponse {
   body: string;
   expires?: string;
}

/**
 * Middleware to cache responses.
 * If the requested route is not configured it default to no-cache.
 *
 * @param {(CacheConfig | CacheConfig[])} [cacheConfig={ path: '*', duration: 10, type: CacheControl.PUBLIC }]
 * @returns {express.RequestHandler}
 */
export function cache(
   cacheConfig: CacheConfig | CacheConfig[] = { path: '*', duration: 10, type: CacheControl.PUBLIC }
): express.RequestHandler {
   // Process configuration
   const configs: CacheConfig[] = [].concat(cacheConfig);
   const pathMatches: RegExp[] = configs.map((config) => pathToRegexp(config.path));
   function memoryCache(req: express.Request, res: express.Response, next: express.NextFunction): void {
      const url: string = req.originalUrl || req.url;
      const key: string = '__express__' + url;
      const config: CacheConfig = getConfig(configs, pathMatches, url);

      // Skip cache
      if (!config || config.type === CacheControl.NO_CACHE) {
         setCacheHeaders(res, config.type);
         next();
         return;
      }

      let cachedResponse: CachedResponse = memCache.get(key);

      if (cachedResponse) {
         // Return cached response
         setCacheHeaders(res, config.type, cachedResponse.expires);
         res.send(cachedResponse.body);
      } else {
         // Cache the response
         const send: express.Send = res.send;

         res.send = function(body: any) {
            cachedResponse = { body, expires: getExpiration(config) };
            setCacheHeaders(res, config.type, cachedResponse.expires);
            memCache.put(key, cachedResponse, (config.duration || 0) * 1000);
            return send.call(this, body);
         };
         next();
      }
   }
   return memoryCache;
}

function getConfig(configs: CacheConfig[], pathMatches: RegExp[], url: string): CacheConfig {
   let config: CacheConfig;

   for (let index = 0; index < configs.length; index++) {
      if (configs[index].path === '*' || pathMatches[index].exec(url)) {
         config = configs[index];
         break;
      }
   }

   return config;
}

function getExpiration(config: CacheConfig): string {
   return new Date(Date.now() + (config.duration || 0) * 1000).toUTCString();
}

function setCacheHeaders(res: express.Response, cacheControl: CacheControl, expires?: string): void {
   if (cacheControl !== CacheControl.NO_CACHE && expires) {
      res.setHeader('Cache-Control', cacheControl);
      res.setHeader('Expires', expires);
   } else {
      res.setHeader('Cache-Control', CacheControl.NO_CACHE);
   }
}
