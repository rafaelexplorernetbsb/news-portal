// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import code coverage support
import '@cypress/code-coverage/support';

// Import accessibility testing
import 'cypress-axe';

// Import real events for better testing
import 'cypress-real-events/support';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that are not related to the application being tested
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      seedDatabase(): Chainable<void>;
      clearDatabase(): Chainable<void>;
      mockApiResponse(endpoint: string, response: any): Chainable<void>;
      checkA11y(): Chainable<void>;
    }
  }
}
