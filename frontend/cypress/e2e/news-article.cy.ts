describe('News Article Page E2E Tests', () => {
  beforeEach(() => {
    cy.seedDatabase();
    cy.visit('/noticia/test-news-1');
  });

  it('should load news article page successfully', () => {
    cy.get('h1').should('contain', 'Test News 1');
    cy.get('[data-testid="article-content"]').should('be.visible');
  });

  it('should display article metadata', () => {
    cy.get('[data-testid="article-date"]').should('be.visible');
    cy.get('[data-testid="article-author"]').should('be.visible');
    cy.get('[data-testid="article-category"]').should('be.visible');
  });

  it('should display breadcrumb navigation', () => {
    cy.get('[data-testid="breadcrumb"]').should('be.visible');
    cy.get('[data-testid="breadcrumb"] a').should('contain', 'Home');
  });

  it('should display social sharing buttons', () => {
    cy.get('[data-testid="social-share"]').should('be.visible');
    cy.get('[data-testid="social-share"] button').should(
      'have.length.greaterThan',
      0
    );
  });

  it('should display related news section', () => {
    cy.get('[data-testid="related-news"]').should('be.visible');
    cy.get('[data-testid="related-news"] .noticia-card').should(
      'have.length.greaterThan',
      0
    );
  });

  it('should navigate to related news', () => {
    cy.get('[data-testid="related-news"] .noticia-card a').first().click();
    cy.url().should('include', '/noticia/');
  });

  it('should handle social sharing', () => {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.get('[data-testid="social-share"] button').first().click();
    cy.get('@windowOpen').should('have.been.called');
  });

  it('should be accessible', () => {
    cy.checkA11y();
  });

  it('should handle 404 for non-existent article', () => {
    cy.visit('/noticia/non-existent-article');
    cy.get('h1').should('contain', '404');
    cy.get('p').should('contain', 'Página não encontrada');
  });
});
