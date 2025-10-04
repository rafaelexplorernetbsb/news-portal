'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4 border-b border-blue-500/30 gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-3xl">📰</span>
            <span className="text-2xl font-bold">Portal de Notícias</span>
          </Link>

          {/* Campo de Busca */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar notícias..."
                className="w-full px-5 py-3 pr-12 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white shadow-lg font-medium"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              >
                <FaSearch className="text-base" />
              </button>
            </div>
          </form>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          <ul className="flex flex-wrap gap-6 text-sm font-medium">
            <li>
              <Link href="/" className="hover:text-blue-200 transition-colors uppercase tracking-wide">
                Home
              </Link>
            </li>
            <li>
              <Link href="/categoria/politica" className="hover:text-blue-200 transition-colors uppercase tracking-wide">
                Política
              </Link>
            </li>
            <li>
              <Link href="/categoria/economia" className="hover:text-blue-200 transition-colors uppercase tracking-wide">
                Economia
              </Link>
            </li>
            <li>
              <Link href="/categoria/tecnologia" className="hover:text-blue-200 transition-colors uppercase tracking-wide">
                Tecnologia
              </Link>
            </li>
            <li>
              <Link href="/categoria/esportes" className="hover:text-blue-200 transition-colors uppercase tracking-wide">
                Esportes
              </Link>
            </li>
            <li>
              <Link href="/categoria/cultura" className="hover:text-blue-200 transition-colors uppercase tracking-wide">
                Cultura
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-blue-200 transition-colors uppercase tracking-wide">
                Sobre
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
