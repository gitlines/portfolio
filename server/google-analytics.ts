import * as cheerio from 'cheerio';
import * as express from 'express';

/**
 * Enum with all possible Google Analytics script types.
 *
 * @enum {string}
 */
export enum GoogleAnalytics {
   TagManager = 'TagManager'
}

/**
 * Configuration options for Google Analytics middleware.
 * @interface GoogleAnalyticsConfig
 */
export interface GoogleAnalyticsConfig {
   /**
    * Type.
    * @type {GoogleAnalytics}
    */
   type: GoogleAnalytics;

   /**
    * Tracking id.
    * @type {string}
    */
   id: string;

   /**
    * Custom script to append to head.
    * @type {string}
    */
   script?: string;

   /**
    * Custom link tag to prepend to head.
    * @type {string}
    */
   link?: string;

   /**
    * Enable Google Analytics script inlining.
    * @type {boolean}
    */
   enabled?: boolean;
}

/**
 * Middleware to inline Google Analytics script.
 *
 * @returns {express.RequestHandler}
 */
export function ga({ type, id, script, link, enabled = true }: GoogleAnalyticsConfig): express.RequestHandler {
   return function(req: express.Request, res: express.Response, next: express.NextFunction): void {
      const referrer: string = req.headers['referer'] || <string>req.headers['referrer'] || '';
      const userAgent: string = req.headers['user-agent'] || '';

      // Check if request is coming from Lighthouse or Headless browser, then skip
      const skip: boolean =
         userAgent.indexOf('Lighthouse') !== -1 || // Request coming from Lighthouse, like Google Page Speed Insights
         userAgent.indexOf('Headless') !== -1 || // Not a real user
         referrer.indexOf('localhost') !== -1 || // Request from same origin
         req.ip === '127.0.0.1'; // Request from same origin

      if (skip || !enabled) {
         next();
         return;
      }

      const send: express.Send = res.send;
      res.send = function(body: any) {
         // Check if body is valid HTML
         const bodyIsHTML: boolean =
            (body instanceof String || typeof body === 'string') && body.indexOf('<html') !== -1;

         // If response body is not HTML
         if (!bodyIsHTML) {
            return send.call(this, body);
         }

         // Append Google Analytics script
         const $ = cheerio.load(body);
         const head = $('head');
         head.prepend(link || GoogleAnalyticsPreconnects[type]);
         head.append(script || GoogleAnalyticsScripts[type](id));

         body = $.xml();
         return send.call(this, body);
      };

      next();
   };
}

const GoogleAnalyticsPreconnects: { [key in GoogleAnalytics]: string } = {
   TagManager: `
      <link href="https://www.googletagmanager.com" rel="preconnect" crossorigin />
      <link href="https://www.google-analytics.com" rel="preconnect" crossorigin />
   `
};

const GoogleAnalyticsScripts: { [key in GoogleAnalytics]: (id: string) => string } = {
   TagManager: (id: string) => `
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${id}');</script>
   `
};
