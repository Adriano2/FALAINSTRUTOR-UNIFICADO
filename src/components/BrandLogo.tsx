/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Logotipos e selos do FalaInstrutor recriados em SVG (vetor), fiéis à marca.
 * Renderizam nítidos em qualquer tamanho e na exportação em PDF (html2canvas).
 */

import React from 'react';

const SLATE = '#1f2a3a';
const GREEN = '#1e9b46';
const NAVY = '#1f2a44';

// Emblema FI: faixa "FALA INSTRUTOR" + triângulo (escudo) + monograma "FI".
export function FiEmblem({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 168" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="FalaInstrutor">
      {/* Faixa superior (banner) */}
      <polygon points="16,6 184,6 169,47 31,47" fill={SLATE} />
      <text
        x="100"
        y="33"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="17"
        textLength="150"
        lengthAdjust="spacingAndGlyphs"
      >
        FALA INSTRUTOR
      </text>
      {/* Triângulo (escudo) abaixo da faixa, à esquerda */}
      <polygon points="33,47 73,47 53,79" fill={SLATE} />
      {/* Monograma "FI" verde */}
      <rect x="58" y="49" width="19" height="95" fill={GREEN} />
      <rect x="58" y="49" width="70" height="19" fill={GREEN} />
      <rect x="58" y="86" width="52" height="18" fill={GREEN} />
      <polygon points="124,49 150,49 124,162 98,162" fill={GREEN} />
    </svg>
  );
}

// Escudo alternativo (cruz branca + chapéu amarelo) — disponível para uso.
export function ShieldEmblem({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="FalaInstrutor">
      <path d="M18,24 Q18,15 27,15 L93,15 Q102,15 102,24 L102,76 Q102,106 60,132 Q18,106 18,76 Z" fill="#1f9d63" />
      <path d="M24,28 Q24,21 31,21 L89,21 Q96,21 96,28 L96,74 Q96,99 60,123 Q24,99 24,74 Z" fill="#27b074" />
      <path d="M31,33 Q31,27 37,27 L83,27 Q89,27 89,33 L89,72 Q89,94 60,114 Q31,94 31,72 Z" fill="none" stroke="#7fe0b0" strokeWidth="2" />
      <rect x="51" y="47" width="18" height="50" rx="1.5" fill="#ffffff" />
      <rect x="37" y="61" width="46" height="18" rx="1.5" fill="#ffffff" />
      <path d="M42,45 A18,15 0 0 1 78,45 Z" fill="#f5b21a" />
      <ellipse cx="60" cy="45" rx="23" ry="5.5" fill="#f5b21a" />
    </svg>
  );
}

// Lockup horizontal: emblema (escudo) + divisória + texto. Usado no topo central.
export function LogoHorizontal({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ShieldEmblem className="h-14 w-auto shrink-0" />
      <div className="w-px self-stretch my-1" style={{ backgroundColor: SLATE }} />
      <div className="flex flex-col leading-none text-left">
        <span className="text-[8px] tracking-[0.22em] font-extrabold uppercase" style={{ color: GREEN }}>
          Higiene Ocupacional
        </span>
        <span className="text-[22px] font-black tracking-tight leading-[0.9]" style={{ color: SLATE }}>
          FALA
        </span>
        <span className="text-[22px] font-black tracking-tight leading-[0.9]" style={{ color: SLATE }}>
          INSTRUTOR
        </span>
        <span className="text-[7px] tracking-[0.18em] font-bold uppercase mt-0.5" style={{ color: '#8a94a6' }}>
          Segurança do Trabalho
        </span>
      </div>
    </div>
  );
}

// Selo de roseta com estrela e fitas (autenticidade), em azul-marinho.
export function RosetteSeal({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 92" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Fitas */}
      <polygon points="22,52 32,48 32,88 20,80" fill={NAVY} />
      <polygon points="42,52 32,48 32,88 44,80" fill={NAVY} />
      {/* Anéis */}
      <circle cx="32" cy="30" r="26" fill="#ffffff" stroke={NAVY} strokeWidth="3" />
      <circle cx="32" cy="30" r="20" fill="none" stroke={NAVY} strokeWidth="1.5" />
      {/* Estrela */}
      <path
        d="M32,19 L34.6,26.4 L42.5,26.6 L36.2,31.4 L38.5,38.9 L32,34.4 L25.5,38.9 L27.8,31.4 L21.5,26.6 L29.4,26.4 Z"
        fill={NAVY}
      />
    </svg>
  );
}
