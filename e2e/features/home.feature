Feature: Home
   As a user
   I want to receive a warm welcome

   Scenario: User redirected to home landing page
      Given I navigate to this site
      Then I am redirected to home
      Then I should see the welcome message
