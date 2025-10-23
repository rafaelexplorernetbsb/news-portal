describe('Home Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page successfully', () => {
    cy.get('h1').should('contain', 'Portal de Notícias');
    cy.get('nav').should('be.visible');
    cy.get('main').should('be.visible');
  });

  it('should display featured news section', () => {
    cy.get('[data-testid="featured-news"]').should('be.visible');
    cy.get('[data-testid="featured-news"] .noticia-card').should(
      'have.length.greaterThan',
      0
    );
  });

  it('should display latest news section', () => {
    cy.get('[data-testid="latest-news"]').should('be.visible');
    cy.get('[data-testid="latest-news"] .noticia-card').should(
      'have.length.greaterThan',
      0
    );
  });

  it('should display categories in navigation', () => {
    cy.get('nav').within(() => {
      cy.get('a[href*="/categoria/"]').should('have.length.greaterThan', 0);
    });
  });

  it('should navigate to category page when clicking category link', () => {
    cy.get('nav a[href*="/categoria/"]').first().click();
    cy.url().should('include', '/categoria/');
    cy.get('h1').should('contain', 'Categoria:');
  });

  it('should search for news', () => {
    cy.get('input[placeholder*="buscar"]').type('tecnologia');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/busca');
    cy.get('h1').should('contain', 'Resultados da busca');
  });

  it('should be responsive on mobile', () => {
    cy.viewport('iphone-x');
    cy.get('nav').should('be.visible');
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
  });

  it('should show notification popup', () => {
    cy.get('[data-testid="notification-popup"]').should('be.visible');
    cy.get('[data-testid="notification-popup"] button').should(
      'contain',
      'Permitir'
    );
  });

  it('should handle notification permission', () => {
    cy.window().then((win) => {
      cy.stub(win.Notification, 'requestPermission').resolves('granted');
    });

    cy.get('[data-testid="notification-popup"] button').click();
    cy.get('[data-testid="notification-popup"]').should('not.be.visible');
  });

  it('should be accessible', () => {
    cy.checkA11y();
  });
});
