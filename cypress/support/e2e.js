// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Mock API responses for E2E tests
beforeEach(() => {
  // Mock Supabase API calls
  cy.intercept('POST', '**/auth/v1/signup', { fixture: 'signup.json' }).as('signup');
  cy.intercept('POST', '**/auth/v1/signin', { fixture: 'signin.json' }).as('signin');
  cy.intercept('POST', '**/auth/v1/signout', { statusCode: 200 }).as('signout');

  // Mock bug API calls
  cy.intercept('GET', '**/rest/v1/bugs*', { fixture: 'bugs.json' }).as('getBugs');
  cy.intercept('POST', '**/rest/v1/bugs', { fixture: 'new-bug.json' }).as('createBug');
  cy.intercept('PATCH', '**/rest/v1/bugs/*', { fixture: 'updated-bug.json' }).as('updateBug');
  cy.intercept('DELETE', '**/rest/v1/bugs/*', { statusCode: 200 }).as('deleteBug');
});