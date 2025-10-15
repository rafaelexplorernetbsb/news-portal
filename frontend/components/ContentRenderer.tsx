import { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export default function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  const [isMarkdown, setIsMarkdown] = useState(false);

  useEffect(() => {
    if (!content) {
      setIsMarkdown(false);
      return;
    }

    // Detectar se o conteúdo é markdown ou HTML
    const markdownPatterns = [
      /^#{1,6}\s+/m,                    // Títulos markdown (# ## ###)
      /\*\*.*?\*\*/,                    // Negrito markdown (**texto**)
      /\*[^*]+\*/,                      // Itálico markdown (*texto*)
      /^\s*[-*+]\s+/m,                  // Listas não ordenadas markdown
      /^\s*\d+\.\s+/m,                  // Listas ordenadas markdown
      /^\s*>\s+/m,                      // Citações markdown
      /\[.*?\]\(.*?\)/,                 // Links markdown [texto](url)
      /```[\s\S]*?```/,                 // Blocos de código markdown
      /^\s*\|.*\|.*\|/m,                // Tabelas markdown
      /!\[.*?\]\(.*?\)/,                // Imagens markdown ![alt](url)
    ];

    const htmlPatterns = [
      /<[^>]+>/,                        // Qualquer tag HTML
      /&[a-zA-Z]+;/,                    // Entidades HTML
    ];

    const markdownMatches = markdownPatterns.reduce((count, pattern) => {
      return count + (content.match(pattern) || []).length;
    }, 0);

    const htmlMatches = htmlPatterns.reduce((count, pattern) => {
      return count + (content.match(pattern) || []).length;
    }, 0);

    // Se tem mais padrões markdown que HTML, é markdown
    setIsMarkdown(markdownMatches > htmlMatches);
  }, [content]);

  if (!content) {
    return <div className={`text-gray-500 italic ${className}`}>Nenhum conteúdo disponível.</div>;
  }

  if (isMarkdown) {
    return <MarkdownRenderer content={content} className={className} />;
  }

  // Renderizar HTML
  return (
    <div
      className={`prose prose-lg max-w-none html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        color: '#2d3748',
        fontSize: '18px',
        lineHeight: '1.7',
      }}
    />
  );
}
