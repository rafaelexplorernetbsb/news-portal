'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function QuemSomosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1c99da] to-[#db0202] rounded-full mb-6">
              <span className="text-3xl font-bold text-white">CD</span>
            </div>
            <h1 className="text-5xl font-bold text-[#333333] mb-6 leading-tight">
              Quem Somos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conheça a história, missão e valores da CrônicaDigital -
              <span className="text-[#1c99da] font-semibold"> informação que conecta você ao mundo</span>
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1c99da] to-[#db0202] mx-auto mt-8 rounded-full"></div>
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* História */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#1c99da] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">📰</span>
                </div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  Nossa História
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  A CrônicaDigital nasceu da paixão por contar histórias e informar pessoas.
                  Fundada com o propósito de democratizar o acesso à informação de qualidade,
                  nossa plataforma se tornou uma referência em jornalismo digital no Brasil.
                </p>
                <p>
                  Desde o início, acreditamos que a informação é um direito fundamental e
                  deve ser acessível a todos. Por isso, desenvolvemos uma plataforma moderna,
                  intuitiva e responsiva que permite aos nossos leitores acompanhar as
                  principais notícias do Brasil e do mundo de forma rápida e confiável.
                </p>
              </div>
            </div>

            {/* Missão */}
            <div className="bg-gradient-to-br from-[#1c99da] to-[#1a8bc7] rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-3xl font-bold">
                  Nossa Missão
                </h2>
              </div>
              <div className="space-y-4 leading-relaxed">
                <p className="text-lg font-semibold">
                  "Informação que conecta você ao mundo"
                </p>
                <p>
                  Buscamos ser a ponte entre os acontecimentos importantes
                  e nossos leitores, oferecendo conteúdo jornalístico de qualidade,
                  sempre com ética, transparência e responsabilidade.
                </p>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#333333] mb-4">
                Nossos Valores
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Os princípios que guiam nosso trabalho e nossa relação com os leitores
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#1c99da] bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-3xl">📰</span>
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-3 text-center">
                  Jornalismo Ético
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Comprometimento com a verdade, imparcialidade e responsabilidade social.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#db0202] bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-3xl">🌐</span>
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-3 text-center">
                  Acessibilidade
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Informação democrática e acessível para todos os públicos.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#1c99da] bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-3 text-center">
                  Inovação
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Uso de tecnologia para melhorar a experiência do leitor.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#db0202] bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-3 text-center">
                  Transparência
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Comunicação clara e honesta com nossos leitores e parceiros.
                </p>
              </div>
            </div>
          </div>

          {/* Equipe e Compromisso */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Equipe */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#db0202] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  Nossa Equipe
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Contamos com uma equipe de profissionais experientes e apaixonados pelo
                  jornalismo. Nossos jornalistas, editores e desenvolvedores trabalham
                  diariamente para garantir que você tenha acesso às melhores informações
                  de forma rápida e confiável.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mt-6">
                  <h4 className="font-semibold text-[#333333] mb-2">Nossa Expertise:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Jornalistas especializados em diferentes áreas</li>
                    <li>• Editores experientes em fact-checking</li>
                    <li>• Desenvolvedores focados em UX/UI</li>
                    <li>• Equipe de marketing digital</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Compromisso */}
            <div className="bg-gradient-to-br from-[#db0202] to-[#c40101] rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h2 className="text-3xl font-bold">
                  Compromisso com a Qualidade
                </h2>
              </div>
              <div className="space-y-4 leading-relaxed">
                <p>
                  Na CrônicaDigital, a qualidade é nossa prioridade. Investimos em
                  tecnologia de ponta, treinamento contínuo da equipe e processos
                  rigorosos de verificação para garantir que cada notícia publicada
                  atenda aos mais altos padrões jornalísticos.
                </p>
                <div className="bg-white bg-opacity-10 rounded-xl p-4 mt-6">
                  <h4 className="font-semibold mb-2">Nossos Padrões:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Verificação rigorosa de fatos</li>
                    <li>• Fontes confiáveis e verificadas</li>
                    <li>• Linguagem clara e acessível</li>
                    <li>• Atualização constante do conteúdo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-[#1c99da] to-[#db0202] rounded-3xl shadow-2xl p-12 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📞</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Entre em Contato
              </h2>
              <p className="text-xl mb-8 leading-relaxed">
                Quer saber mais sobre a CrônicaDigital? Tem sugestões ou dúvidas?
                Estamos sempre prontos para ouvir nossos leitores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/fale-conosco"
                  className="bg-white text-[#1c99da] font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Fale Conosco
                </a>
                <a
                  href="/anuncie"
                  className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-[#1c99da] transition-all duration-300 hover:scale-105"
                >
                  Anuncie Conosco
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
