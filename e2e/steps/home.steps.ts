import { expect } from 'chai';
import { Before, Then } from 'cucumber';
import { AppPage } from './app.po';

let page: AppPage;

Before(() => {
   page = new AppPage();
});

Then('I am redirected to home', async () => expect(await page.getCurrentUrl()).contains('/home'));
