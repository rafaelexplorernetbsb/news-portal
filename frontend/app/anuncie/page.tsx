'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AnunciePage() {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    tipoAnuncio: '',
    orcamento: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio do formulário
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        tipoAnuncio: '',
        orcamento: '',
        mensagem: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1c99da] to-[#db0202] rounded-full mb-6">
              <span className="text-3xl">💼</span>
            </div>
            <h1 className="text-5xl font-bold text-[#333333] mb-6 leading-tight">
              Anuncie Conosco
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Alcance milhares de leitores e promova sua marca na CrônicaDigital
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1c99da] to-[#db0202] mx-auto mt-8 rounded-full"></div>
          </div>

          {/* Seção de Benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-[#1c99da] to-[#1a8bc7] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">👥</span>
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-4">
                Grande Alcance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Milhares de leitores únicos mensais em todo o Brasil
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-[#db0202] to-[#c40101] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-4">
                Público Qualificado
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Audiência engajada e interessada em notícias de qualidade
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-[#1c99da] to-[#db0202] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl text-white">📊</span>
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-4">
                Relatórios Detalhados
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Métricas completas de performance dos seus anúncios
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário de Contato */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-[#db0202] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  Solicite um Orçamento
                </h2>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <p className="font-semibold">Solicitação enviada com sucesso!</p>
                    <p className="text-sm">Entraremos em contato em breve.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <div>
                    <p className="font-semibold">Erro ao enviar solicitação</p>
                    <p className="text-sm">Tente novamente em alguns instantes.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-semibold text-[#333333] mb-3">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#db0202] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="empresa" className="block text-sm font-semibold text-[#333333] mb-3">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#db0202] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[#333333] mb-3">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#db0202] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefone" className="block text-sm font-semibold text-[#333333] mb-3">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#db0202] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tipoAnuncio" className="block text-sm font-semibold text-[#333333] mb-3">
                      Tipo de Anúncio *
                    </label>
                    <select
                      id="tipoAnuncio"
                      name="tipoAnuncio"
                      value={formData.tipoAnuncio}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#db0202] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="banner">Banner Publicitário</option>
                      <option value="patrocinado">Conteúdo Patrocinado</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="evento">Patrocínio de Evento</option>
                      <option value="parceria">Parceria Editorial</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="orcamento" className="block text-sm font-semibold text-[#333333] mb-3">
                      Orçamento Estimado *
                    </label>
                    <select
                      id="orcamento"
                      name="orcamento"
                      value={formData.orcamento}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#db0202] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                    >
                      <option value="">Selecione a faixa</option>
                      <option value="ate-5k">Até R$ 5.000</option>
                      <option value="5k-10k">R$ 5.000 - R$ 10.000</option>
                      <option value="10k-25k">R$ 10.000 - R$ 25.000</option>
                      <option value="25k-50k">R$ 25.000 - R$ 50.000</option>
                      <option value="acima-50k">Acima de R$ 50.000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-semibold text-[#333333] mb-3">
                    Detalhes do Projeto *
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#db0202] focus:border-transparent transition-all duration-300 hover:border-gray-300 resize-none"
                    placeholder="Descreva seu projeto, objetivos e qualquer informação relevante..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#db0202] to-[#c40101] hover:from-[#c40101] hover:to-[#db0202] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </span>
                  ) : (
                    'Solicitar Orçamento'
                  )}
                </button>
              </form>
            </div>

            {/* Informações sobre Anúncios */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-[#1c99da] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h2 className="text-3xl font-bold text-[#333333]">
                    Opções de Publicidade
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="border-l-4 border-[#1c99da] pl-6 py-4 bg-gray-50 rounded-r-xl">
                    <h3 className="text-xl font-bold text-[#333333] mb-3">
                      🎯 Banner Publicitário
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Posicionamento estratégico em todas as páginas do site
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>• Banner superior (728x90)</p>
                      <p>• Banner lateral (300x250)</p>
                      <p>• Banner inferior (728x90)</p>
                    </div>
                  </div>

                  <div className="border-l-4 border-[#db0202] pl-6 py-4 bg-gray-50 rounded-r-xl">
                    <h3 className="text-xl font-bold text-[#333333] mb-3">
                      📰 Conteúdo Patrocinado
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Artigos e matérias personalizadas para sua marca
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>• Conteúdo editorial de qualidade</p>
                      <p>• Posicionamento destacado</p>
                      <p>• Identificação clara como patrocinado</p>
                    </div>
                  </div>

                  <div className="border-l-4 border-[#1c99da] pl-6 py-4 bg-gray-50 rounded-r-xl">
                    <h3 className="text-xl font-bold text-[#333333] mb-3">
                      📧 Newsletter
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Alcance direto aos assinantes da nossa newsletter
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>• Envio semanal</p>
                      <p>• Conteúdo segmentado</p>
                      <p>• Alta taxa de abertura</p>
                    </div>
                  </div>

                  <div className="border-l-4 border-[#db0202] pl-6 py-4 bg-gray-50 rounded-r-xl">
                    <h3 className="text-xl font-bold text-[#333333] mb-3">
                      🤝 Parceria Editorial
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Colaboração estratégica de longo prazo
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>• Desconto especial</p>
                      <p>• Suporte dedicado</p>
                      <p>• Relatórios personalizados</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1c99da] to-[#1a8bc7] rounded-2xl shadow-xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📞</span>
                  </div>
                  <h3 className="text-2xl font-bold">
                    Contato Direto
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold mb-2">Comercial</p>
                    <p className="text-lg">comercial@cronicadigital.com.br</p>
                    <p className="text-lg">(11) 99999-9999</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-2">WhatsApp</p>
                    <p className="text-lg">(11) 99999-9999</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#db0202] to-[#c40101] rounded-2xl shadow-xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold">
                    Vantagens Exclusivas
                  </h3>
                </div>
                <ul className="text-lg space-y-3">
                  <li className="flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    Relatórios detalhados de performance
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    Suporte técnico especializado
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    Flexibilidade de pagamento
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    Campanhas personalizadas
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    Acompanhamento dedicado
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
