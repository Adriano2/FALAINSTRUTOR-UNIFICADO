/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Logotipos do FalaInstrutor recriados em SVG (vetor), fiéis à marca:
 * um escudo verde com cruz branca (saúde) e chapéu amarelo (segurança),
 * acompanhado do lockup "Higiene Ocupacional / FALA INSTRUTOR /
 * Segurança do Trabalho".
 *
 * Renderizam nítidos em qualquer tamanho e também na exportação em PDF
 * do certificado (html2canvas).
 */

import React from 'react';

const GREEN_DARK = '#1f9d63';
const GREEN = '#27b074';
const GREEN_LINE = '#7fe0b0';
const YELLOW = '#f5b21a';
const NAVY = '#1f2a3a';
const GRAY = '#8a94a6';

// Escudo (emblema) com cruz branca e chapéu amarelo.
export function ShieldEmblem({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="FalaInstrutor">
      {/* Escudo externo (borda mais escura) */}
      <path
        d="M18,24 Q18,15 27,15 L93,15 Q102,15 102,24 L102,76 Q102,106 60,132 Q18,106 18,76 Z"
        fill={GREEN_DARK}
      />
      {/* Corpo do escudo */}
      <path
        d="M24,28 Q24,21 31,21 L89,21 Q96,21 96,28 L96,74 Q96,99 60,123 Q24,99 24,74 Z"
        fill={GREEN}
      />
      {/* Filete interno claro */}
      <path
        d="M31,33 Q31,27 37,27 L83,27 Q89,27 89,33 L89,72 Q89,94 60,114 Q31,94 31,72 Z"
        fill="none"
        stroke={GREEN_LINE}
        strokeWidth="2"
      />
      {/* Cruz branca (saúde) */}
      <rect x="51" y="47" width="18" height="50" rx="1.5" fill="#ffffff" />
      <rect x="37" y="61" width="46" height="18" rx="1.5" fill="#ffffff" />
      {/* Chapéu amarelo (segurança) sobre o topo da cruz */}
      <path d="M42,45 A18,15 0 0 1 78,45 Z" fill={YELLOW} />
      <ellipse cx="60" cy="45" rx="23" ry="5.5" fill={YELLOW} />
    </svg>
  );
}

// Lockup horizontal: escudo + divisória + texto. Usado no topo central.
export function LogoHorizontal({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ShieldEmblem className="h-16 w-auto shrink-0" />
      <div className="w-px self-stretch my-1" style={{ backgroundColor: NAVY }} />
      <div className="flex flex-col leading-none text-left">
        <span className="text-[8px] tracking-[0.22em] font-extrabold uppercase" style={{ color: GREEN_DARK }}>
          Higiene Ocupacional
        </span>
        <span className="text-[24px] font-black tracking-tight leading-[0.92]" style={{ color: NAVY }}>
          FALA
        </span>
        <span className="text-[24px] font-black tracking-tight leading-[0.92]" style={{ color: NAVY }}>
          INSTRUTOR
        </span>
        <span className="text-[8px] tracking-[0.18em] font-bold uppercase mt-0.5" style={{ color: GRAY }}>
          Segurança do Trabalho
        </span>
      </div>
    </div>
  );
}
