import { expect } from 'chai';
import { Before, Given, Then } from 'cucumber';
import { AppPage } from './app.po';

let page: AppPage;

Before(() => (page = new AppPage()));

Given('I navigate to this site', () => page.navigateTo());

Then('I should see the welcome message', async () =>
   expect(await page.getText('app-shell header')).equals('Portfolio')
);
