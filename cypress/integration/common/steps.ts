namespace CommonSteps {
   const { Given, Then } = require('cypress-cucumber-preprocessor/steps');

   Given('I navigate to this site', () => {
      cy.visit('/');
   });

   Then('I should see the welcome message', () => {
      cy.get('app-shell header').contains('Portfolio');
   });
}
