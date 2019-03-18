Feature: Home
   As a user
   I want to receive a warm welcome

   Scenario: User redirected to home landing page
      Given I navigate to an nonexisting page
      Then I should see the welcome message
