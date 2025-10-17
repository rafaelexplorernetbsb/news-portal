import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#333333] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Sobre */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1c99da] to-[#db0202] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CD</span>
              </div>
              CrônicaDigital
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Informação que conecta você ao mundo. Seu portal de notícias confiável,
              trazendo as informações mais relevantes e atualizadas do Brasil e do mundo.
            </p>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#1c99da]">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categoria/politica" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Brasil/Política/Economia
                </Link>
              </li>
              <li>
                <Link href="/categoria/tecnologia" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link href="/categoria/esportes" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Esportes
                </Link>
              </li>
              <li>
                <Link href="/categoria/cultura" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Entretenimento
                </Link>
              </li>
              <li>
                <Link href="/categoria/saude" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Saúde
                </Link>
              </li>
              <li>
                <Link href="/categoria/mundo" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Mundo
                </Link>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#1c99da]">Institucional</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/quem-somos" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Quem somos
                </Link>
              </li>
              <li>
                <Link href="/fale-conosco" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Fale conosco
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link href="/anuncie" className="text-gray-300 hover:text-[#1c99da] transition-colors">
                  Anuncie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 pt-6 text-center text-gray-400">
          <p>&copy; 2025 CrônicaDigital. Todos os direitos reservados.</p>
          <p className="text-xs mt-2 uppercase tracking-wider">INFORMAÇÃO QUE CONECTA VOCÊ AO MUNDO</p>
        </div>
      </div>
    </footer>
  );
}
