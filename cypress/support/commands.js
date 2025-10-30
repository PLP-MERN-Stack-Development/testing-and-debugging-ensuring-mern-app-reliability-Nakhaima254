// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for authentication
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.session([email, password], () => {
    cy.visit('/auth');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="signin-button"]').click();
    cy.url().should('not.include', '/auth');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/auth');
});

// Custom commands for bug management
Cypress.Commands.add('createBug', (bugData) => {
  cy.get('[data-testid="create-bug-button"]').click();
  cy.get('[data-testid="bug-title-input"]').type(bugData.title);
  cy.get('[data-testid="bug-description-input"]').type(bugData.description);
  cy.get('[data-testid="bug-severity-select"]').select(bugData.severity);
  cy.get('[data-testid="bug-priority-select"]').select(bugData.priority);
  cy.get('[data-testid="submit-bug-button"]').click();
  cy.get('[data-testid="bug-card"]').should('contain', bugData.title);
});

Cypress.Commands.add('editBug', (bugTitle, newData) => {
  cy.contains('[data-testid="bug-card"]', bugTitle).within(() => {
    cy.get('[data-testid="edit-bug-button"]').click();
  });

  if (newData.title) {
    cy.get('[data-testid="bug-title-input"]').clear().type(newData.title);
  }
  if (newData.description) {
    cy.get('[data-testid="bug-description-input"]').clear().type(newData.description);
  }
  if (newData.severity) {
    cy.get('[data-testid="bug-severity-select"]').select(newData.severity);
  }
  if (newData.status) {
    cy.get('[data-testid="bug-status-select"]').select(newData.status);
  }

  cy.get('[data-testid="submit-bug-button"]').click();
});

Cypress.Commands.add('deleteBug', (bugTitle) => {
  cy.contains('[data-testid="bug-card"]', bugTitle).within(() => {
    cy.get('[data-testid="delete-bug-button"]').click();
  });
  cy.get('[data-testid="confirm-delete-button"]').click();
  cy.contains(bugTitle).should('not.exist');
});

// Custom commands for filtering
Cypress.Commands.add('filterBugs', (filters) => {
  if (filters.search) {
    cy.get('[data-testid="search-input"]').type(filters.search);
  }
  if (filters.status) {
    cy.get('[data-testid="status-filter"]').select(filters.status);
  }
  if (filters.severity) {
    cy.get('[data-testid="severity-filter"]').select(filters.severity);
  }
  if (filters.priority) {
    cy.get('[data-testid="priority-filter"]').select(filters.priority);
  }
});

// Custom commands for assertions
Cypress.Commands.add('shouldHaveBug', (bugData) => {
  cy.get('[data-testid="bug-card"]').should('contain', bugData.title);
  if (bugData.severity) {
    cy.get('[data-testid="bug-card"]').should('contain', bugData.severity);
  }
  if (bugData.status) {
    cy.get('[data-testid="bug-card"]').should('contain', bugData.status);
  }
});

Cypress.Commands.add('shouldNotHaveBug', (bugTitle) => {
  cy.get('[data-testid="bug-card"]').should('not.contain', bugTitle);
});