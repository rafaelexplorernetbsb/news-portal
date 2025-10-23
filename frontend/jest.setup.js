import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useParams: () => ({
    slug: 'test-slug',
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock Directus functions
jest.mock('@/lib/directus', () => ({
  getCategoriaNome: jest.fn().mockResolvedValue('Tecnologia'),
  getNoticias: jest.fn().mockResolvedValue([]),
  getCategorias: jest.fn().mockResolvedValue([]),
  getNoticiaBySlug: jest.fn().mockResolvedValue(null),
  getNoticiasByCategoria: jest.fn().mockResolvedValue([]),
  getProjectName: jest
    .fn()
    .mockImplementation((name) => name || 'Portal de Notícias'),
  getProjectDescriptor: jest
    .fn()
    .mockImplementation((desc) => desc || 'Sua fonte de notícias'),
  getProjectSettings: jest.fn().mockResolvedValue({
    project_name: 'Portal de Notícias',
    project_descriptor: 'Sua fonte de notícias',
  }),
  getLogoUrl: jest.fn().mockResolvedValue('https://example.com/logo.png'),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    permission: 'granted',
    requestPermission: jest.fn().mockResolvedValue('granted'),
  })),
});

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn().mockResolvedValue({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
    ready: Promise.resolve({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  },
});

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
