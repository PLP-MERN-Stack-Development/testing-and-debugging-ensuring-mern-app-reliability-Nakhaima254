describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should redirect to auth page when not logged in', () => {
    cy.url().should('include', '/auth');
  });

  it('should show login form', () => {
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="signin-button"]').should('be.visible');
    cy.contains('Sign Up').should('be.visible');
  });

  it('should allow user to sign up', () => {
    cy.contains('Sign Up').click();

    cy.get('[data-testid="email-input"]').type('newuser@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="fullname-input"]').type('New User');
    cy.get('[data-testid="signup-button"]').click();

    cy.url().should('not.include', '/auth');
    cy.contains('Welcome').should('be.visible');
  });

  it('should allow user to sign in', () => {
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="signin-button"]').click();

    cy.url().should('not.include', '/auth');
    cy.contains('Welcome').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', '**/auth/v1/signin', {
      statusCode: 400,
      body: { error: 'Invalid credentials' }
    }).as('signinError');

    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="signin-button"]').click();

    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should allow user to logout', () => {
    // First login
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="signin-button"]').click();

    // Then logout
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();

    cy.url().should('include', '/auth');
  });
});