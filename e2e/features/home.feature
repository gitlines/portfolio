Feature: App
   As a user
   I want to receive a warm welcome

   Scenario: Navigate to the app
      Given I navigate to this site
      Then I am redirected to home
      Then I should see the welcome message
