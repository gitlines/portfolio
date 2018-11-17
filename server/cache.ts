import * as memoryCache from 'memory-cache';

export function cache(duration: number) {
   duration = duration || 10;

   return (req, res, next) => {
      const url = req.originalUrl || req.url;
      const key = '__express__' + url;
      const cachedBody = memoryCache.get(key);

      if (cachedBody) {
         console.log(`Serving from cache for ${url}`);
         res.send(cachedBody);
         return;
      } else {
         res.sendResponse = res.send;
         res.send = (body) => {
            memoryCache.put(key, body, duration * 1000);
            console.log(`Cache saved for ${url}`);
            res.sendResponse(body);
         };
         next();
      }
   };
}
