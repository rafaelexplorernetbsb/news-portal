'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone de erro 404 */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-gray-300 mb-4">
            404
          </div>
          <div className="w-16 h-1 bg-[#1c99da] mx-auto rounded-full"></div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Página não encontrada
        </h1>

        {/* Descrição */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          A página que você está procurando não existe ou foi movida.
          Que tal explorar nossas últimas notícias?
        </p>

        {/* Botões de ação */}
        <div className="space-y-4">
          <Link
            href="/"
            className="w-full bg-[#1c99da] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1680b8] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <FaHome className="w-4 h-4" />
            Ir para a Página Inicial
          </Link>

          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Voltar à Página Anterior
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Se você acredita que isso é um erro, entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
}
