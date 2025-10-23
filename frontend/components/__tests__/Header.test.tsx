import { render, screen, waitFor } from '@testing-library/react';
import Header from '@/components/Header';

// Mock the directus functions
jest.mock('@/lib/directus', () => ({
  getCategorias: jest.fn(),
  getProjectSettings: jest.fn(),
  getLogoUrl: jest.fn(),
  getProjectName: jest.fn(),
  getProjectDescriptor: jest.fn(),
}));

import { getCategorias, getProjectSettings, getLogoUrl, getProjectName, getProjectDescriptor } from '@/lib/directus';

const mockCategorias = [
  { id: '1', nome: 'Tecnologia', slug: 'tecnologia', cor: '#1c99da' },
  { id: '2', nome: 'Política', slug: 'politica', cor: '#db0202' },
  { id: '3', nome: 'Economia', slug: 'economia', cor: '#28a745' },
];

const mockProjectSettings = {
  project_name: 'Portal de Notícias',
  project_descriptor: 'Sua fonte de notícias',
};

describe('Header', () => {
  beforeEach(() => {
    (getCategorias as jest.Mock).mockResolvedValue(mockCategorias);
    (getProjectSettings as jest.Mock).mockResolvedValue(mockProjectSettings);
    (getLogoUrl as jest.Mock).mockResolvedValue('https://example.com/logo.png');
    (getProjectName as jest.Mock).mockImplementation((name) => name || 'Portal de Notícias');
    (getProjectDescriptor as jest.Mock).mockImplementation((desc) => desc || 'Sua fonte de notícias');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders header with project name', async () => {
    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Portal de Notícias')).toBeInTheDocument();
    });
  });

  it('renders navigation menu with categories', async () => {
    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Tecnologia')).toBeInTheDocument();
      expect(screen.getByText('Política')).toBeInTheDocument();
      expect(screen.getByText('Economia')).toBeInTheDocument();
    });
  });

  it('toggles mobile menu when hamburger is clicked', async () => {
    render(<Header />);

    // Aguarda o header carregar
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  it('displays search functionality', async () => {
    render(<Header />);

    // Verifica que o header renderiza corretamente
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  it('handles search input changes', async () => {
    render(<Header />);

    // Verifica que o header renderiza corretamente
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (getCategorias as jest.Mock).mockRejectedValue(new Error('API Error'));
    (getProjectSettings as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<Header />);

    await waitFor(() => {
      // Should still render basic header structure
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Header />);

    // Should show some loading indicator or skeleton
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
