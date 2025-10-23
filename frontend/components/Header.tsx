'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import {
  getProjectSettings,
  getLogoUrl,
  type DirectusSettings,
  getProjectName,
  getProjectDescriptor,
  getCategorias,
  type Categoria,
} from '@/lib/directus';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projectSettings, setProjectSettings] = useState<DirectusSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar configurações do projeto
        const settings = await getProjectSettings();
        if (settings) {
          setProjectSettings(settings);
          const logo = getLogoUrl(settings.project_logo);
          setLogoUrl(logo);
        }

        // Buscar categorias
        const categoriasData = await getCategorias();
        setCategorias(categoriasData);
      } catch (error) {
        // Silencioso em produção
      }
    }

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky  border-b-3 border-[#1c99da]   top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar - Logo e Busca */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            {logoUrl ? (
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={projectSettings?.project_name || 'Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#1c99da] to-[#db0202] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">CD</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#333333]">
                {getProjectName(projectSettings?.project_name || null)}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {getProjectDescriptor(projectSettings?.project_descriptor || null)}
              </span>
            </div>
          </Link>

          {/* Campo de Busca */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite sua busca"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c99da] focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1c99da] transition-colors"
              >
                <FaSearch className="text-sm" />
              </button>
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-[#333333] hover:text-[#1c99da] transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`py-4 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <ul className="flex flex-wrap gap-6 text-sm font-medium">
            <li>
              <Link
                href="/"
                className={`text-[#333333] hover:text-[#1c99da] transition-colors font-semibold ${
                  pathname === '/' ? 'underline decoration-2 underline-offset-4' : ''
                }`}
              >
                Últimas notícias
              </Link>
            </li>
            {categorias.length === 0 ? (
              <li className="text-gray-400">Carregando categorias...</li>
            ) : (
              categorias.map((categoria) => (
                <li key={categoria.id}>
                  <Link
                    href={`/categoria/${categoria.slug}`}
                    className={`text-[#333333] hover:text-[#1c99da] transition-colors ${
                      pathname === `/categoria/${categoria.slug}` ? 'underline decoration-2 underline-offset-4' : ''
                    }`}
                  >
                    {categoria.nome}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>

        {/* Mobile Search */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite sua busca"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c99da] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1c99da] transition-colors"
                >
                  <FaSearch className="text-sm" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
