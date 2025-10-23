import { render, screen } from '@testing-library/react';
import ArticleMedia from '@/components/ArticleMedia';

// Mock do Next.js Image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('ArticleMedia', () => {
  it('should render video embed when embedHtml is provided', () => {
    const embedHtml = '<iframe src="https://youtube.com/embed/123"></iframe>';

    const { container } = render(
      <ArticleMedia
        title="Test Article"
        embedHtml={embedHtml}
        imageUrl="https://example.com/image.jpg"
      />
    );

    // Deve existir iframe
    const iframes = container.querySelectorAll('iframe');
    expect(iframes.length).toBeGreaterThan(0);

    // NÃO deve existir img (renderização mutuamente exclusiva)
    expect(screen.queryByAltText('Test Article')).not.toBeInTheDocument();
  });

  it('should render image when no video is provided', () => {
    render(
      <ArticleMedia
        title="Test Article"
        imageUrl="https://example.com/image.jpg"
        imageAlt="Test Image"
      />
    );

    // Deve existir img
    expect(screen.getByAltText('Test Image')).toBeInTheDocument();

    // NÃO deve existir iframe
    expect(screen.queryByTitle('Vídeo')).not.toBeInTheDocument();
  });

  it('should render video from videoUrl when embedHtml is not provided', () => {
    const { container } = render(
      <ArticleMedia
        title="Test Article"
        videoUrl="https://youtube.com/watch?v=123"
        imageUrl="https://example.com/image.jpg"
      />
    );

    // Deve existir iframe
    const iframes = container.querySelectorAll('iframe');
    expect(iframes.length).toBeGreaterThan(0);

    // NÃO deve existir img
    expect(screen.queryByAltText('Test Article')).not.toBeInTheDocument();
  });

  it('should render nothing when neither video nor image is provided', () => {
    const { container } = render(
      <ArticleMedia title="Test Article" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should prioritize embedHtml over videoUrl', () => {
    const embedHtml = '<iframe src="https://youtube.com/embed/123"></iframe>';

    const { container } = render(
      <ArticleMedia
        title="Test Article"
        embedHtml={embedHtml}
        videoUrl="https://youtube.com/watch?v=456"
        imageUrl="https://example.com/image.jpg"
      />
    );

    // Deve usar embedHtml (iframe com src="https://youtube.com/embed/123")
    const iframes = container.querySelectorAll('iframe');
    expect(iframes.length).toBeGreaterThan(0);

    // NÃO deve existir img
    expect(screen.queryByAltText('Test Article')).not.toBeInTheDocument();
  });
});
