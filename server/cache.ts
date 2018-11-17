import * as memoryCache from 'memory-cache';

export function cache(duration: number) {
   duration = duration || 10;

   return (req, res, next) => {
      const key = '__express__' + req.originalUrl || req.url;
      const cachedBody = memoryCache.get(key);
      if (cachedBody) {
         res.send(cachedBody);
         return;
      } else {
         res.sendResponse = res.send;
         res.send = (body) => {
            memoryCache.put(key, body, duration * 1000);
            res.sendResponse(body);
         };
         next();
      }
   };
}
