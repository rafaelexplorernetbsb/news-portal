'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FaleConoscoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
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
      setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
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
              <span className="text-3xl">📞</span>
            </div>
            <h1 className="text-5xl font-bold text-[#333333] mb-6 leading-tight">
              Fale Conosco
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sua opinião é importante para nós. Entre em contato e vamos conversar!
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1c99da] to-[#db0202] mx-auto mt-8 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário de Contato */}
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-[#1c99da] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">✉️</span>
                </div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  Envie sua Mensagem
                </h2>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <p className="font-semibold">Mensagem enviada com sucesso!</p>
                    <p className="text-sm">Entraremos em contato em breve.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <div>
                    <p className="font-semibold">Erro ao enviar mensagem</p>
                    <p className="text-sm">Tente novamente em alguns instantes.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
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
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c99da] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                    placeholder="Seu nome completo"
                  />
                </div>

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
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c99da] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="assunto" className="block text-sm font-semibold text-[#333333] mb-3">
                    Assunto *
                  </label>
                  <select
                    id="assunto"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c99da] focus:border-transparent transition-all duration-300 hover:border-gray-300"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="sugestao">Sugestão de Notícia</option>
                    <option value="correcao">Correção de Informação</option>
                    <option value="parceria">Proposta de Parceria</option>
                    <option value="suporte">Suporte Técnico</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-semibold text-[#333333] mb-3">
                    Mensagem *
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c99da] focus:border-transparent transition-all duration-300 hover:border-gray-300 resize-none"
                    placeholder="Digite sua mensagem aqui..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#1c99da] to-[#1a8bc7] hover:from-[#1a8bc7] hover:to-[#1c99da] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Mensagem'
                  )}
                </button>
              </form>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-[#db0202] bg-opacity-10 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h2 className="text-3xl font-bold text-[#333333]">
                    Outras Formas de Contato
                  </h2>
                </div>

                <div className="space-y-8">
                  <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300">
                    <div className="w-16 h-16 bg-[#1c99da] bg-opacity-10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📧</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] mb-3">
                        E-mail
                      </h3>
                      <p className="text-gray-600 mb-2 font-medium">contato@cronicadigital.com.br</p>
                      <p className="text-gray-600 mb-2 font-medium">redacao@cronicadigital.com.br</p>
                      <p className="text-sm text-gray-500">
                        Respondemos em até 24 horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300">
                    <div className="w-16 h-16 bg-[#db0202] bg-opacity-10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📱</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] mb-3">
                        WhatsApp
                      </h3>
                      <p className="text-gray-600 mb-2 font-medium">(11) 99999-9999</p>
                      <p className="text-sm text-gray-500">
                        Segunda a sexta, 9h às 18h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300">
                    <div className="w-16 h-16 bg-[#1c99da] bg-opacity-10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">🏢</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] mb-3">
                        Endereço
                      </h3>
                      <p className="text-gray-600 mb-1">
                        Rua das Notícias, 123<br />
                        Centro - São Paulo/SP<br />
                        CEP: 01234-567
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300">
                    <div className="w-16 h-16 bg-[#db0202] bg-opacity-10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">⏰</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] mb-3">
                        Horário de Funcionamento
                      </h3>
                      <p className="text-gray-600 mb-1">
                        Segunda a Sexta: 9h às 18h<br />
                        Sábado: 9h às 12h<br />
                        Domingo: Fechado
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#db0202] to-[#c40101] rounded-2xl shadow-xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">🚨</span>
                  </div>
                  <h3 className="text-2xl font-bold">
                    Denúncia ou Correção
                  </h3>
                </div>
                <p className="text-lg mb-4 leading-relaxed">
                  Encontrou alguma informação incorreta ou tem uma denúncia importante?
                </p>
                <p className="text-sm opacity-90">
                  Use o assunto "Correção de Informação" no formulário ao lado ou
                  envie diretamente para: <strong>correcao@cronicadigital.com.br</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
