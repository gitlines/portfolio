import { Before, Given, Then } from 'cucumber';
import { expect } from 'chai';
import { AppPage } from './app.po';

let page: AppPage;

Before(() => {
   page = new AppPage();
});

Given('I navigate to this site', () => page.navigateTo());

Then('I should see the welcome message', async () =>
   expect(await page.getParagraphText()).equals('Welcome to portfolio!')
);
