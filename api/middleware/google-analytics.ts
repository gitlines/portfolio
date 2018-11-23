import * as cheerio from 'cheerio';
import * as express from 'express';

/**
 * Enum with all possible Google Analytics script types.
 *
 * @enum {string}
 */
export enum GoogleAnalytics {
   TagManager = 'TagManager',
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

// Scripts and links

const preconnects: { [key in GoogleAnalytics]: string } = {
   TagManager: `
      <link href="https://www.googletagmanager.com" rel="preconnect" crossorigin />
      <link href="https://www.google-analytics.com" rel="preconnect" crossorigin />
   `,
};

const scripts: { [key in GoogleAnalytics]: (id: string) => string } = {
   TagManager: (id: string) => `
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${id}');</script>
   `,
};

/**
 * Middleware to inline Google Analytics script.
 *
 * @returns {express.RequestHandler}
 */
export function ga({ type, id, script, link, enabled = true }: GoogleAnalyticsConfig): express.RequestHandler {
   function googleAnalytics(req: express.Request, res: express.Response, next: express.NextFunction): void {
      if (enabled && !skipRequest(req)) {
         // Intercept send method to add script

         const send: express.Send = res.send;
         res.send = function(body: any) {
            if (isHTMLBody(body)) {
               const gaLink = link || preconnects[type];
               const gaScript = script || scripts[type](id);
               body = addGoogleAnalytics(body, gaLink, gaScript);
            }
            return send.call(this, body);
         };
      }

      next();
   }
   return googleAnalytics;
}

// Auxiliary methods

function skipRequest(req: express.Request): boolean {
   const referrer: string = req.headers['referer'] || <string>req.headers['referrer'] || '';
   const userAgent: string = req.headers['user-agent'] || '';

   // Request coming from Lighthouse, like Google Page Speed Insights
   const isLighthouse: boolean = userAgent.indexOf('Lighthouse') !== -1;

   // Not a real user
   const isHeadless: boolean = userAgent.indexOf('Headless') !== -1;

   // Request from same origin
   const isLocalhost: boolean = referrer.indexOf('localhost') !== -1 || req.ip === '127.0.0.1';

   return isLighthouse || isHeadless || isLocalhost;
}

function isHTMLBody(body: any) {
   const isString: boolean = body instanceof String || typeof body === 'string';
   const hasHtml = isString && body.indexOf('<html') !== -1;
   return hasHtml;
}

function addGoogleAnalytics(body: string, headPrepend: string, headAppend: string): string {
   const $ = cheerio.load(body);
   const head = $('head');
   head.prepend(headPrepend);
   head.append(headAppend);
   return $.xml();
}
