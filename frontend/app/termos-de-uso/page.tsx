'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1c99da] to-[#db0202] rounded-full mb-6">
              <span className="text-3xl">📋</span>
            </div>
            <h1 className="text-5xl font-bold text-[#333333] mb-6 leading-tight">
              Termos de Uso
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conheça os termos e condições de uso da CrônicaDigital
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1c99da] to-[#db0202] mx-auto mt-8 rounded-full"></div>
            <p className="text-sm text-gray-500 mt-6">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Conteúdo Principal */}
          <div className="space-y-8">
            {/* Seção 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#1c99da] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-[#1c99da]">1</span>
                </div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  Aceitação dos Termos
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-700 leading-relaxed text-lg">
                  Ao acessar e utilizar o site CrônicaDigital, você concorda em cumprir
                  e estar vinculado aos seguintes termos e condições de uso. Se você
                  não concordar com qualquer parte destes termos, não deve utilizar
                  nosso site.
                </p>
              </div>
            </div>

            {/* Seção 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#db0202] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-[#db0202]">2</span>
                </div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  Descrição do Serviço
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-700 leading-relaxed text-lg">
                  A CrônicaDigital é uma plataforma de notícias online que oferece
                  conteúdo jornalístico, informações e serviços relacionados ao
                  jornalismo digital. Nosso objetivo é fornecer informações precisas,
                  atualizadas e relevantes para nossos usuários.
                </p>
              </div>
            </div>

            {/* Seção 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#1c99da] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-[#1c99da]">3</span>
                </div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  Uso Aceitável
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  Você concorda em usar nosso site apenas para fins legais e de
                  acordo com estes termos. É proibido:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ul className="text-gray-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        Usar o site para qualquer propósito ilegal
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        Interferir no funcionamento do site
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ul className="text-gray-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        Tentar obter acesso não autorizado
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        Reproduzir conteúdo sem autorização
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Seções Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Propriedade Intelectual */}
              <div className="bg-gradient-to-br from-[#1c99da] to-[#1a8bc7] rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">©</span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    Propriedade Intelectual
                  </h2>
                </div>
                <p className="leading-relaxed">
                  Todo o conteúdo presente no site CrônicaDigital é propriedade nossa
                  ou de nossos licenciadores e está protegido por leis de direitos autorais.
                </p>
              </div>

              {/* Privacidade */}
              <div className="bg-gradient-to-br from-[#db0202] to-[#c40101] rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    Privacidade
                  </h2>
                </div>
                <p className="leading-relaxed">
                  Respeitamos sua privacidade e nos comprometemos a proteger suas
                  informações pessoais conforme nossa Política de Privacidade.
                </p>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-gradient-to-r from-[#1c99da] to-[#db0202] rounded-3xl shadow-2xl p-12 text-center text-white">
              <div className="max-w-4xl mx-auto">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📋</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Resumo dos Termos
                </h2>
                <p className="text-xl mb-8 leading-relaxed">
                  Ao usar a CrônicaDigital, você concorda em usar nosso conteúdo
                  apenas para fins pessoais, respeitar nossos direitos autorais e
                  não usar o site para atividades ilegais.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/fale-conosco"
                    className="bg-white text-[#1c99da] font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                  >
                    Dúvidas? Fale Conosco
                  </a>
                  <a
                    href="/quem-somos"
                    className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-[#1c99da] transition-all duration-300 hover:scale-105"
                  >
                    Conheça Nossa História
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
