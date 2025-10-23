// Custom commands for E2E testing

Cypress.Commands.add('login', (email = 'admin@example.com', password = 'admin123') => {
  cy.session([email, password], () => {
    cy.visit('/admin/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin');
  });
});

Cypress.Commands.add('logout', () => {
  cy.visit('/admin');
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/admin/login');
});

Cypress.Commands.add('seedDatabase', () => {
  // Seed test data
  cy.request('POST', '/api/test/seed', {
    categories: [
      { nome: 'Tecnologia', slug: 'tecnologia', cor: '#1c99da' },
      { nome: 'Política', slug: 'politica', cor: '#db0202' },
    ],
    news: [
      {
        titulo: 'Test News 1',
        slug: 'test-news-1',
        resumo: 'Test summary',
        conteudo: 'Test content',
        categoria: 'tecnologia',
        destaque: true,
      },
    ],
  });
});

Cypress.Commands.add('clearDatabase', () => {
  cy.request('POST', '/api/test/clear');
});

Cypress.Commands.add('mockApiResponse', (endpoint: string, response: any) => {
  cy.intercept('GET', endpoint, response).as('mockApi');
});
