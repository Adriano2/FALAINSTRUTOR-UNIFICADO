/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phone, ShieldCheck, Mail, Building, Instagram, Youtube, Linkedin } from 'lucide-react';
import { LayoutConfig, PaymentConfig } from '../types';
import { ShieldEmblem } from './BrandLogo';

interface FooterProps {
  layoutConfig: LayoutConfig;
  paymentConfig: PaymentConfig;
  onNavigate: (screen: string) => void;
}

export default function Footer({ layoutConfig, paymentConfig, onNavigate }: FooterProps) {
  // Floating Whatsapp handler
  const handleWhatsappClick = () => {
    const cleanPhone = layoutConfig.phone.replace(/[^0-9]/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=Olá%20FalaInstrutor!%20Gostaria%20de%20tirar%20uma%20dúvida%20sobre%20os%20treinamentos.`, '_blank');
  };

  return (
    <footer className="relative bg-white text-slate-600 font-sans border-t border-slate-200 transition-colors duration-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Desc */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 font-bold text-xl select-none" id="footer-logo">
              <ShieldEmblem className="h-9 w-auto shrink-0" />
              <span className="text-slate-850 font-display font-semibold text-lg">
                Fala<span className="text-blue-500 font-bold">Instrutor</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 font-medium">
              Solução definitiva em treinamentos regulamentares (NRs) e formação profissional em saúde, segurança e trânsito (SST). Educação a distância, presencial e semipresencial em conformidade com as normas do Ministério do Trabalho e Emprego.
            </p>
            <div className="flex gap-4 text-slate-400 text-xs">
              <span className="hover:text-blue-450 transition-colors cursor-pointer" onClick={() => onNavigate('validate-certificate')}>Validar QR Code</span>
              <span>•</span>
              <span className="hover:text-blue-450 transition-colors">SST</span>
            </div>

            {/* Redes sociais (exibe apenas as que estiverem configuradas) */}
            {(layoutConfig.instagramUrl || layoutConfig.youtubeUrl || layoutConfig.linkedinUrl) && (
              <div className="pt-1">
                <h4 className="text-[10px] font-bold tracking-wider text-slate-800 uppercase mb-2">Redes Sociais</h4>
                <div className="flex items-center gap-3">
                  {layoutConfig.instagramUrl && (
                    <a href={layoutConfig.instagramUrl} target="_blank" rel="noreferrer" title="Instagram"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {layoutConfig.youtubeUrl && (
                    <a href={layoutConfig.youtubeUrl} target="_blank" rel="noreferrer" title="YouTube"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-colors">
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {layoutConfig.linkedinUrl && (
                    <a href={layoutConfig.linkedinUrl} target="_blank" rel="noreferrer" title="LinkedIn"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-blue-700 hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Col 2: Useful Links */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-slate-900 transition-colors text-slate-505 font-medium">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-slate-900 transition-colors text-slate-505 font-medium">
                  Treinamentos NRs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('validate-certificate')} className="hover:text-slate-900 transition-colors text-slate-505 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Validar Certificado
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('projeto-pedagogico')}
                  className="hover:text-slate-900 text-left transition-colors text-slate-505 font-medium"
                >
                  Projeto Pedagógico dos Cursos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => alert("Baixando ART (Anotação de Responsabilidade Técnica) Geral de Treinamentos homologada no CREA-SP...")} 
                  className="hover:text-slate-900 text-left transition-colors text-slate-505 font-medium"
                >
                  ART dos Treinamentos das NRs
                </button>
              </li>
              <li>
                <button onClick={() => alert("Termos de Privacidade e conformidade LGPD de dados FalaInstrutor.")} className="hover:text-slate-900 transition-colors text-slate-505 font-medium">
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button onClick={() => alert("Código de Defesa do Consumidor, Direito de Arrependimento de 7 dias e homologações.")} className="hover:text-slate-900 transition-colors text-slate-505 font-medium">
                  Aviso Legal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Accreditation & Badges */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">Credenciamento</h3>
            
            <div className="space-y-3">
              {/* ABED Badge */}
              <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-205 rounded-xl">
                <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg flex flex-col items-center justify-center border border-slate-200">
                  <span className="text-[10px] font-black text-blue-500 tracking-tighter">ABED</span>
                  <span className="text-[7px] text-slate-600 font-medium leading-none">MEMBRO</span>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-800">Associados ABED</h4>
                  <p className="text-[9px] text-slate-505 font-medium">Assoc. Brasileira de Educação a Distância</p>
                </div>
              </div>

              {/* CREA Badge */}
              <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-205 rounded-xl">
                <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg flex flex-col items-center justify-center border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-850 tracking-tighter">CREA</span>
                  <span className="text-[7px] text-blue-500 font-bold leading-none">SP</span>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-800 font-display">Registro CREA-SP</h4>
                  <p className="text-[9px] text-slate-505 font-medium">Certificados homologados pelo Eng. Resp.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Corporate details & Contact */}
          <div className="space-y-3 text-xs">
            <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase mb-4">Contato & Suporte</h3>
            <p className="flex items-center gap-2 text-slate-600 font-medium">
              <Phone className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{layoutConfig.phone}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-600 font-medium">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <span>suporte@falainstrutor.com.br</span>
            </p>
            <p className="flex items-center gap-2 text-slate-600 font-medium">
              <Building className="w-4 h-4 text-blue-500 shrink-0" />
              <span>CNPJ: {paymentConfig.cnpj}</span>
            </p>
          </div>

         </div>

        <hr className="my-8 border-slate-200" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FALA INSTRUTOR A2 CONSUTORIA SEG HIGIENE OCUPACIONAL. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Segurança do Trabalho</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Direção Defensiva</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">NRs Homologadas</span>
          </div>
        </div>
      </div>

      {/* Floating Green WhatsApp Button */}
      <button 
        onClick={handleWhatsappClick}
        className="fixed bottom-6 right-6 z-50 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
        title="Fale conosco no WhatsApp"
        id="floating-whatsapp-btn"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:pr-2 transition-all duration-300 text-xs font-semibold whitespace-nowrap">
          Suporte Whatsapp
        </span>
        {/* Customized SVG Whatsapp Icon */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M12.012 3H12c-4.963 0-9 4.037-9 9 0 1.843.559 3.558 1.516 4.99L3.5 20.5l3.655-1.042c1.4.887 3.053 1.405 4.845 1.405h.012c4.963 0 9-4.037 9-9s-4.037-9-9-9zm.012 1.5c4.136 0 7.5 3.364 7.5 7.5s-3.364 7.5-7.5 7.5h-.012c-1.579 0-3.04-.492-4.25-1.332l-.248-.172-2.18.62.632-2.138-.184-.265c-.886-1.275-1.403-2.812-1.403-4.475a7.51 7.51 0 0 1 7.5-7.5l.012.002zm-1.815 2.115c-.266 0-.58.118-.813.376-.232.257-.887.868-.887 2.118 0 1.25.908 2.457 1.033 2.628.125.171 1.748 2.67 4.254 3.753.595.258 1.06.411 1.424.526.598.19 1.144.163 1.574.099.48-.072 1.48-.606 1.688-1.192.208-.585.208-1.087.146-1.192-.062-.105-.23-.168-.48-.293s-1.48-.73-1.71-.813c-.23-.083-.396-.125-.562.125s-.646.813-.792.98c-.146.166-.292.187-.542.062s-1.057-.39-2.015-1.244c-.742-.663-1.246-1.482-1.391-1.73-.146-.25-.015-.386.11-.51.112-.113.25-.292.375-.438.125-.145.166-.25.25-.417.083-.166.042-.312-.02-.438s-.562-1.354-.77-1.854c-.203-.487-.411-.421-.563-.429l-.479-.009z" />
        </svg>
      </button>
    </footer>
  );
}
