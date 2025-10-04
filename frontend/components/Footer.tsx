import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Sobre */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📰</span>
              Portal de Notícias
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Seu portal de notícias confiável, trazendo as informações mais relevantes
              e atualizadas do Brasil e do mundo.
            </p>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="text-xl font-bold mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categoria/politica" className="text-gray-300 hover:text-white transition-colors">
                  Política
                </Link>
              </li>
              <li>
                <Link href="/categoria/economia" className="text-gray-300 hover:text-white transition-colors">
                  Economia
                </Link>
              </li>
              <li>
                <Link href="/categoria/tecnologia" className="text-gray-300 hover:text-white transition-colors">
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link href="/categoria/esportes" className="text-gray-300 hover:text-white transition-colors">
                  Esportes
                </Link>
              </li>
              <li>
                <Link href="/categoria/cultura" className="text-gray-300 hover:text-white transition-colors">
                  Cultura
                </Link>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-xl font-bold mb-4">Institucional</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-300 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidade" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-uso" className="text-gray-300 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>&copy; 2025 Portal de Notícias. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
