namespace HomeSteps {
   const { Given } = require('cypress-cucumber-preprocessor/steps');

   Given('I navigate to an nonexisting page', () => {
      cy.visit('/non-existing');
   });
}
