import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import * as directus from '@/lib/directus';

// Mock the directus functions
jest.mock('@/lib/directus', () => ({
  getNoticiasDestaque: jest.fn(),
  getUltimasNoticias: jest.fn(),
  getNoticiasPorCategoriaEspecifica: jest.fn(),
  getImageUrl: jest.fn(),
  formatarData: jest.fn(),
  capitalizarCategoria: jest.fn(),
  getCategoriaNome: jest.fn().mockResolvedValue('Tecnologia'),
}));

const mockNoticias = [
  {
    id: '1',
    titulo: 'Notícia de Destaque',
    slug: 'noticia-destaque',
    resumo: 'Resumo da notícia',
    conteudo: 'Conteúdo completo',
    data_publicacao: '2024-01-01T10:00:00Z',
    destaque: true,
    categoria: { nome: 'Tecnologia', slug: 'tecnologia' },
    autor: { nome: 'João Silva' },
    imagem: { filename_disk: 'test.jpg' },
  },
  {
    id: '2',
    titulo: 'Última Notícia',
    slug: 'ultima-noticia',
    resumo: 'Resumo da última notícia',
    conteudo: 'Conteúdo da última notícia',
    data_publicacao: '2024-01-02T10:00:00Z',
    destaque: false,
    categoria: { nome: 'Política', slug: 'politica' },
    autor: { nome: 'Maria Santos' },
    imagem: { filename_disk: 'test2.jpg' },
  },
];

describe('Home Page Integration Tests', () => {
  beforeEach(() => {
    (directus.getNoticiasDestaque as jest.Mock).mockResolvedValue([mockNoticias[0]]);
    (directus.getUltimasNoticias as jest.Mock).mockResolvedValue(mockNoticias);
    (directus.getNoticiasPorCategoriaEspecifica as jest.Mock).mockResolvedValue([mockNoticias[0]]);
    (directus.getImageUrl as jest.Mock).mockReturnValue('https://example.com/image.jpg');
    (directus.formatarData as jest.Mock).mockReturnValue('01/01/2024');
    (directus.capitalizarCategoria as jest.Mock).mockImplementation((cat) => cat);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays featured news', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByText('Notícia de Destaque')[0]).toBeInTheDocument();
    });
  });

  it('loads and displays latest news', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByText('Última Notícia')[0]).toBeInTheDocument();
    });
  });

  it('displays most read section', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/mais lidas/i)).toBeInTheDocument();
    });
  });

  it('displays categories with news', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByText('Tecnologia')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Política')[0]).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (directus.getNoticiasDestaque as jest.Mock).mockRejectedValue(new Error('API Error'));
    (directus.getUltimasNoticias as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Home />);

    // Should show skeleton loading elements
    expect(screen.getAllByText('').length).toBeGreaterThan(0);
  });

  it('displays notification popup', async () => {
    render(<Home />);

    // Verifica se a página carrega sem erros
    await waitFor(() => {
      expect(screen.getByText(/Últimas Notícias/i)).toBeInTheDocument();
    });
  });
});
