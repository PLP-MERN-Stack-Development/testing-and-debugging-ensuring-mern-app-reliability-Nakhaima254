describe('Bug Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  it('should display bug list', () => {
    cy.get('[data-testid="bug-card"]').should('have.length.greaterThan', 0);
    cy.contains('Login button not working').should('be.visible');
  });

  it('should create a new bug', () => {
    cy.get('[data-testid="create-bug-button"]').click();

    cy.get('[data-testid="bug-title-input"]').type('New Cypress Bug');
    cy.get('[data-testid="bug-description-input"]').type('This bug was created by Cypress E2E test');
    cy.get('[data-testid="bug-severity-select"]').select('high');
    cy.get('[data-testid="bug-priority-select"]').select('medium');
    cy.get('[data-testid="submit-bug-button"]').click();

    cy.contains('New Cypress Bug').should('be.visible');
    cy.contains('high').should('be.visible');
  });

  it('should edit an existing bug', () => {
    cy.contains('[data-testid="bug-card"]', 'Login button not working').within(() => {
      cy.get('[data-testid="edit-bug-button"]').click();
    });

    cy.get('[data-testid="bug-title-input"]').clear().type('Updated Login Issue');
    cy.get('[data-testid="bug-description-input"]').clear().type('Updated description for login issue');
    cy.get('[data-testid="bug-status-select"]').select('in-progress');
    cy.get('[data-testid="submit-bug-button"]').click();

    cy.contains('Updated Login Issue').should('be.visible');
    cy.contains('in-progress').should('be.visible');
  });

  it('should filter bugs by status', () => {
    cy.get('[data-testid="status-filter"]').select('open');
    cy.get('[data-testid="bug-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'open');
    });
  });

  it('should filter bugs by severity', () => {
    cy.get('[data-testid="severity-filter"]').select('critical');
    cy.get('[data-testid="bug-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'critical');
    });
  });

  it('should search bugs by title', () => {
    cy.get('[data-testid="search-input"]').type('login');
    cy.get('[data-testid="bug-card"]').should('have.length', 1);
    cy.contains('Login button not working').should('be.visible');
  });

  it('should search bugs by description', () => {
    cy.get('[data-testid="search-input"]').type('mobile');
    cy.get('[data-testid="bug-card"]').should('have.length', 1);
    cy.contains('Dashboard loading slow').should('be.visible');
  });

  it('should combine filters', () => {
    cy.get('[data-testid="status-filter"]').select('resolved');
    cy.get('[data-testid="severity-filter"]').select('low');
    cy.get('[data-testid="search-input"]').type('styling');

    cy.get('[data-testid="bug-card"]').should('have.length', 1);
    cy.contains('Minor styling issue').should('be.visible');
  });

  it('should show no results for non-matching search', () => {
    cy.get('[data-testid="search-input"]').type('nonexistent');
    cy.contains('No bugs found').should('be.visible');
  });

  it('should clear filters', () => {
    cy.get('[data-testid="status-filter"]').select('open');
    cy.get('[data-testid="search-input"]').type('login');

    // Clear search
    cy.get('[data-testid="search-input"]').clear();

    // Reset status filter
    cy.get('[data-testid="status-filter"]').select('all');

    // Should show all bugs again
    cy.get('[data-testid="bug-card"]').should('have.length.greaterThan', 1);
  });

  it('should display bug details correctly', () => {
    cy.get('[data-testid="bug-card"]').first().within(() => {
      cy.get('[data-testid="bug-icon"]').should('be.visible');
      cy.get('[data-testid="badge"]').should('have.length.greaterThan', 1);
      cy.get('[data-testid="edit-bug-button"]').should('be.visible');
    });
  });

  it('should handle form validation', () => {
    cy.get('[data-testid="create-bug-button"]').click();

    // Try to submit without title
    cy.get('[data-testid="submit-bug-button"]').click();

    cy.contains('Title is required').should('be.visible');

    // Fill title but try to submit without severity
    cy.get('[data-testid="bug-title-input"]').type('Test Bug');
    cy.get('[data-testid="submit-bug-button"]').click();

    // Should show validation error or prevent submission
    cy.url().should('include', '/dashboard'); // Still on dashboard if validation failed
  });
});