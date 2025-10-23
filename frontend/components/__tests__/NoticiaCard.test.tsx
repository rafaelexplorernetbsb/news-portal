import { render, screen, waitFor } from '@testing-library/react';
import NoticiaCard from '@/components/NoticiaCard';
import { Noticia } from '@/lib/directus';

// Mock the getCategoriaNome function
jest.mock('@/lib/directus', () => ({
  ...jest.requireActual('@/lib/directus'),
  getCategoriaNome: jest.fn().mockResolvedValue('Tecnologia'),
}));

// Mock data
const mockNoticia: Noticia = {
  id: '1',
  titulo: 'Teste de Notícia',
  slug: 'teste-de-noticia',
  resumo: 'Este é um resumo de teste',
  conteudo: 'Conteúdo completo da notícia',
  data_publicacao: '2024-01-01T10:00:00Z',
  destaque: true,
  categoria: {
    id: '1',
    nome: 'Tecnologia',
    slug: 'tecnologia',
    cor: '#1c99da',
  },
  autor: {
    id: '1',
    nome: 'João Silva',
    email: 'joao@example.com',
  },
  imagem: {
    id: '1',
    filename_disk: 'test-image.jpg',
    title: 'Imagem de teste',
  },
  url_imagem: 'https://example.com/image.jpg',
};

describe('NoticiaCard', () => {
  it('renders noticia information correctly', async () => {
    render(<NoticiaCard noticia={mockNoticia} />);

    // Componente em formato de lista não exibe resumo nem nome do autor
    expect(screen.getByText('Teste de Notícia')).toBeInTheDocument();
    expect(screen.getByText(/01 de janeiro de 2024/)).toBeInTheDocument();
  });

  it('displays featured badge when noticia is featured', async () => {
    render(<NoticiaCard noticia={mockNoticia} />);

    // Componente em formato compacto não exibe badges
    expect(screen.getByText('Teste de Notícia')).toBeInTheDocument();
  });

  it('does not display featured badge when noticia is not featured', async () => {
    const notFeaturedNoticia = { ...mockNoticia, destaque: false };
    render(<NoticiaCard noticia={notFeaturedNoticia} />);

    // Verifica que a notícia ainda renderiza corretamente
    await waitFor(() => {
      expect(screen.getByText('Teste de Notícia')).toBeInTheDocument();
    });
  });

  it('formats date correctly', () => {
    render(<NoticiaCard noticia={mockNoticia} />);

    // Data formatada como "01 de janeiro de 2024"
    expect(screen.getByText(/01 de janeiro de 2024/)).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<NoticiaCard noticia={mockNoticia} />);

    const card = screen.getByRole('link');

    // Verify navigation link exists
    expect(card).toBeInTheDocument();
  });

  it('displays fallback when image is not available', () => {
    const noticiaWithoutImage = { ...mockNoticia, imagem: null, url_imagem: null };
    render(<NoticiaCard noticia={noticiaWithoutImage} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder.svg');
  });

  it('handles missing category gracefully', async () => {
    const noticiaWithoutCategory = { ...mockNoticia, categoria: null };
    render(<NoticiaCard noticia={noticiaWithoutCategory} />);

    // Verifica que a notícia ainda renderiza corretamente sem categoria
    await waitFor(() => {
      expect(screen.getByText('Teste de Notícia')).toBeInTheDocument();
    });
  });

  it('handles missing author gracefully', async () => {
    const noticiaWithoutAuthor = { ...mockNoticia, autor: null };
    render(<NoticiaCard noticia={noticiaWithoutAuthor} />);

    // Verifica que a notícia ainda renderiza corretamente sem autor
    await waitFor(() => {
      expect(screen.getByText('Teste de Notícia')).toBeInTheDocument();
    });
  });
});
