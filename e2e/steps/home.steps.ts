import { Before, Given } from 'cucumber';
import { AppPage } from './app.po';

let page: AppPage;

Before(() => (page = new AppPage()));

Given('I navigate to an nonexisting page', () => page.navigateTo());
