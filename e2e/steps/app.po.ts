import { browser, by, element } from 'protractor';

export class AppPage {
   navigateTo(url: string = '/') {
      return browser.get(url);
   }

   getCurrentUrl() {
      return browser.getCurrentUrl();
   }

   getText(cssSelector: string) {
      return element(by.css(cssSelector)).getText();
   }
}
