'use client';

import Link from 'next/link';
import {
  getProjectSettings,
  getLogoUrl,
  type DirectusSettings,
  getProjectName,
  getProjectDescriptor,
} from '@/lib/directus';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [projectSettings, setProjectSettings] =
    useState<DirectusSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getProjectSettings();
      if (settings) {
        setProjectSettings(settings);
        const logo = getLogoUrl(settings.project_logo);
        setLogoUrl(logo);
      }
    }

    fetchSettings();
  }, []);

  return (
    <footer className="bg-[#333333] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Seção Principal Centralizada */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-3">
            {logoUrl ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={projectSettings?.project_name || 'Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-[#1c99da] to-[#db0202] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CD</span>
              </div>
            )}
            {getProjectName(projectSettings?.project_name || null)}
          </h3>
          <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Informação que conecta você ao mundo. Seu portal de notícias
            confiável, trazendo as informações mais relevantes e atualizadas do
            Brasil e do mundo.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 pt-6 text-center text-gray-400">
          <p>
            &copy; 2025 {getProjectName(projectSettings?.project_name || null)}.
            Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2 uppercase tracking-wider">
            INFORMAÇÃO QUE CONECTA VOCÊ AO MUNDO
          </p>
        </div>
      </div>
    </footer>
  );
}
