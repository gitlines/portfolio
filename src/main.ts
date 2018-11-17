import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
   enableProdMode();

   // Skip Google Analytics script for Page Speed Insights and Lighthouse
   if (
      navigator.userAgent.indexOf('Lighthouse') === -1 &&
      navigator.userAgent.indexOf('Headless') === -1 &&
      document.location.href.indexOf('localhost') === -1
   ) {
      // Insert Google Analytics script
      const head: HTMLHeadElement = document.getElementsByTagName('head')[0];

      const gtmScript: HTMLScriptElement = document.createElement('script');
      gtmScript.innerHTML = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5QWK985');
   `;
      head.appendChild(gtmScript);
   }
}

document.addEventListener('DOMContentLoaded', () => {
   platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.log(err));
});
