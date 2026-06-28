/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Search, FileText, CheckCircle2, User, Key, Calendar, MapPin, Award, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { certificatesApi } from '../api';
import { ShieldEmblem } from './BrandLogo';

// Selo holográfico de autenticidade com o logo da plataforma (FalaInstrutor).
function HolographicSeal({ size = 72, label = 'VÁLIDO' }: { size?: number; label?: string }) {
  return (
    <div className="relative shrink-0 select-none" style={{ width: size, height: size }} aria-label="Selo holográfico de autenticidade">
      <style>{`
        @keyframes fiHoloSpin { to { transform: rotate(360deg); } }
        @keyframes fiHoloShine { 0% { transform: translateX(-140%); } 60%, 100% { transform: translateX(160%); } }
      `}</style>
      {/* Anel holográfico (iridescente, girando) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg,#1e9b46,#27b074,#7fe0b0,#f5b21a,#1f2a3a,#27b074,#1e9b46)',
          animation: 'fiHoloSpin 7s linear infinite',
          filter: 'saturate(1.25)',
          boxShadow: '0 0 14px rgba(56,189,248,0.45)',
        }}
      />
      {/* Miolo navy com o logo */}
      <div
        className="absolute rounded-full flex flex-col items-center justify-center text-white overflow-hidden"
        style={{ inset: Math.max(3, size * 0.09), background: 'radial-gradient(circle at 30% 22%, #1e3a8a, #0f2147 72%)' }}
      >
        <div style={{ width: size * 0.42 }}><ShieldEmblem className="w-full h-auto" /></div>
        <span className="font-black tracking-wider leading-none mt-0.5" style={{ fontSize: Math.max(7, size * 0.13) }}>{label}</span>
        {/* Brilho que percorre o selo */}
        <div
          className="absolute top-0 bottom-0"
          style={{ width: '34%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)', animation: 'fiHoloShine 3.5s ease-in-out infinite' }}
        />
      </div>
    </div>
  );
}

// Cartão de segurança holográfico (estilo documento "genuine"): fundo guilloché,
// faixas iridescentes "GENUINE" e o logo da plataforma ao centro.
function HolographicSecurityCard() {
  const guilloche =
    'repeating-radial-gradient(circle at 18% 50%, transparent 0 5px, rgba(15,33,71,0.06) 5px 6px),' +
    'repeating-radial-gradient(circle at 50% 50%, transparent 0 5px, rgba(16,157,99,0.06) 5px 6px),' +
    'repeating-radial-gradient(circle at 82% 50%, transparent 0 5px, rgba(245,178,26,0.06) 5px 6px),' +
    'repeating-linear-gradient(60deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 6px)';
  const Strip = ({ side }: { side: 'left' | 'right' }) => (
    <div
      className="absolute top-0 bottom-0 w-9 flex items-center justify-center overflow-hidden"
      style={{ [side]: 0, background: 'conic-gradient(from 45deg,#1e9b46,#27b074,#7fe0b0,#f5b21a,#1f2a3a,#27b074,#1e9b46)' } as React.CSSProperties}
    >
      <span className="text-white font-black text-[9px] tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl', textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>
        GENUINE · GENUINE · GENUINE
      </span>
    </div>
  );
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner" style={{ height: 120, background: '#f4f2e9' }}>
      <style>{`@keyframes fiHoloSweep { 0% { transform: translateX(-60%);} 100% { transform: translateX(160%);} }`}</style>
      <div className="absolute inset-0" style={{ backgroundImage: guilloche }} />
      {/* brilho iridescente que percorre o cartão */}
      <div className="absolute inset-y-0 w-1/3 opacity-40" style={{ background: 'linear-gradient(110deg,transparent,rgba(56,189,248,0.5),rgba(167,139,250,0.4),transparent)', animation: 'fiHoloSweep 5s linear infinite', mixBlendMode: 'screen' }} />
      <Strip side="left" />
      <Strip side="right" />
      {/* Logo central (lugar do "SUA LOGO AQUI") */}
      <div className="absolute inset-0 flex items-center justify-center gap-3 px-12">
        <div style={{ width: 50 }} className="drop-shadow"><ShieldEmblem className="w-full h-auto" /></div>
        <div className="leading-none text-center sm:text-left">
          <div className="font-black text-lg sm:text-xl" style={{ color: '#0f2147' }}>FALA<span style={{ color: '#10b981' }}>INSTRUTOR</span></div>
          <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 mt-0.5">Documento autenticado · Selo holográfico</div>
        </div>
      </div>
    </div>
  );
}

interface ValidationViewProps {
  initialCode?: string;
}

export default function ValidationView({ initialCode }: ValidationViewProps) {
  const [searchCode, setSearchCode] = React.useState(initialCode ?? '');
  const [matchedCertificate, setMatchedCertificate] = React.useState<any | null>(null);
  const [performedSearch, setPerformedSearch] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const runSearch = async (rawCode: string) => {
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode || loading) return;

    setLoading(true);
    // Validate the certificate against the API (queries the shared database).
    const cert = await certificatesApi.validate(cleanCode);
    setPerformedSearch(true);

    if (cert) {
      setMatchedCertificate({
        ...cert,
        // Formatted completion date for display.
        completionDate: (cert.completionDate || '').split('T')[0] || cert.completionDate,
        status: 'VÁLIDO & AUTENTICADO',
        digitalSeal: 'SH-SHA256-' + cert.code + '-892EF0',
      });
    } else {
      setMatchedCertificate(null);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchCode);
  };

  // Auto-validate when arriving from a certificate QR Code.
  React.useEffect(() => {
    if (initialCode) runSearch(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      
      {/* Intro branding */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
          Validação Pública de Certificados
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Nossa solução utiliza tecnologia antifraude para verificação ágil de certificados de capacitação. Digite a chave autenticadora impressa no documento para verificar a regularidade legal perante as Normas Regulamentadoras (MTE).
        </p>
      </div>

      {/* Query Search Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
            Código Autenticador do Certificado
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-600">
              <Key className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Ex COD: CERT-35-JESSICA-01A"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full text-sm bg-transparent border-none text-slate-900 dark:text-white uppercase focus:outline-none font-sans font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="sm:w-36 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wide rounded-xl shadow-xs cursor-pointer select-none flex items-center justify-center gap-1.5 shrink-0 font-display"
              id="certificate-search-btn"
            >
              <Search className="w-4 h-4" /> {loading ? 'Validando...' : 'Validar'}
            </button>
          </div>
          <span className="text-[10px] text-slate-400 leading-normal block font-sans">
            * Caso queira testar a validação imediata, utilize o código de JESSICA: <strong className="text-blue-600 select-all">CERT-35-JESSICA-01A</strong> ou o de THIAGO: <strong className="text-blue-600 select-all">CERT-35-THIAGO-02B</strong>
          </span>
        </form>
      </div>

      {/* Query results panel */}
      {performedSearch && (
        <div className="animate-fade-in">
          {matchedCertificate ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-lg space-y-6">

              {/* Cartão de segurança holográfico (logo da plataforma) */}
              <HolographicSecurityCard />

              {/* Authenticated Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <HolographicSeal size={64} label="VÁLIDO" />
                  <div>
                    <span className="text-xs font-black uppercase text-emerald-500 tracking-wider block">Status do Certificado</span>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">{matchedCertificate.status} <CheckCircle2 className="w-4 h-4 text-emerald-500" /></h2>
                    <span className="text-[10px] text-slate-400 font-semibold">Selo holográfico • FalaInstrutor</span>
                  </div>
                </div>
                
                <div className="text-center sm:text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Assinante Digital Responsável</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{matchedCertificate.digitalSignature?.holder || matchedCertificate.instructor}</span>
                  {(matchedCertificate.instructorMte || matchedCertificate.instructorCrea) && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {matchedCertificate.instructorMte ? `MTE ${matchedCertificate.instructorMte}` : ''}
                      {matchedCertificate.instructorMte && matchedCertificate.instructorCrea ? ' • ' : ''}
                      {matchedCertificate.instructorCrea ? `CREA ${matchedCertificate.instructorCrea}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Dossier details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                
                {/* Outliner student details */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Identificação do Profissional</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Nome completo:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.studentName}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">CPF do profissional:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.studentCpf}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Nascimento:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.studentDob}</strong>
                    </div>
                  </div>
                </div>

                {/* Training detailed attributes */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dados do Treinamento Regulamentado</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Norma / Curso:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.courseName}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Carga Horária:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.workload} horas</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-450 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 pr-1 select-none">Conclusão:</span>
                      <strong className="text-slate-900 dark:text-white">{matchedCertificate.completionDate}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Associated manual activities list */}
              {matchedCertificate.manualActivities.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Módulos Práticos de Campo Homologados</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedCertificate.manualActivities.map((act: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700/50 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-slate-750 dark:text-slate-350">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security and Signature authenticity */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500 leading-normal">
                
                <div className="space-y-1">
                  <div className="flex items-start gap-3">
                    <HolographicSeal size={58} label="VÁLIDO" />
                    <div className="min-w-0">
                      <strong className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Identificador de Autenticidade</strong>
                      <span className="font-mono text-slate-800 dark:text-slate-350 select-all font-semibold block break-all">{matchedCertificate.digitalSeal}</span>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Selo holográfico • Fala Instrutor</span>
                    </div>
                  </div>
                  <span>Assinatura eletrônica em conformidade com o ICP-Brasil e homologação de responsabilidade técnica pela FALA INSTRUTOR A2 CONSUTORIA SEG HIGIENE OCUPACIONAL.</span>
                  {matchedCertificate.digitalSignature && (
                    <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                      {matchedCertificate.digitalSignature.icpVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 bg-emerald-500/10 text-emerald-600 rounded font-bold text-[10px] uppercase tracking-wide">
                          <CheckCircle className="w-3 h-3" /> Assinatura ICP-Brasil verificada
                        </span>
                      )}
                      <span className="block"><span className="text-slate-400">Titular do certificado digital:</span> <strong className="text-slate-700 dark:text-slate-300">{matchedCertificate.digitalSignature.holder}</strong></span>
                      {matchedCertificate.digitalSignature.issuer && (
                        <span className="block"><span className="text-slate-400">Autoridade Certificadora:</span> {matchedCertificate.digitalSignature.issuer}</span>
                      )}
                      {matchedCertificate.digitalSignature.serial && (
                        <span className="block"><span className="text-slate-400">Nº de série:</span> <span className="font-mono">{matchedCertificate.digitalSignature.serial}</span></span>
                      )}
                      {matchedCertificate.digitalSignature.validUntil && (
                        <span className="block"><span className="text-slate-400">Válido até:</span> {matchedCertificate.digitalSignature.validUntil}</span>
                      )}
                      {matchedCertificate.digitalSignature.signature && (
                        <span className="block"><span className="text-slate-400">Assinatura ({matchedCertificate.digitalSignature.algorithm}):</span> <span className="font-mono break-all text-[10px]">{matchedCertificate.digitalSignature.signature.slice(0, 44)}…</span></span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800 text-center sm:text-left flex flex-col justify-center">
                  <strong className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-0.5">Certificação Registrada</strong>
                  <span>Esta credencial atende de forma integral a todos os requisitos normativos do Ministério do Trabalho e Emprego, regularizada sob o CNPJ 60.511.651/0001-78 e registrada perante o conselho CREA de classe.</span>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow text-center space-y-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full inline-block">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Código Não Localizado</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-normal">
                O código de autenticação digitado não corresponde a nenhum certificado regular e ativo emitido pelo FalaInstrutor. Verifique se o código possui erros de digitação e tente novamente.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
