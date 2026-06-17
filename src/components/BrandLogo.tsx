/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Logotipos do FalaInstrutor recriados em SVG (vetor), fiéis à marca:
 * faixa "FALA INSTRUTOR" + triângulo (escudo) + monograma "FI" em verde.
 *
 * Renderizam de forma nítida em qualquer tamanho e também na exportação em
 * PDF do certificado (html2canvas).
 */

import React from 'react';

const SLATE = '#3b434f';
const GREEN = '#1e9b46';

// Emblema compacto: faixa + escudo + monograma FI. Usado na coluna esquerda
// do certificado (acima do QR Code) e dentro do lockup horizontal.
export function FiEmblem({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 168" className={className} xmlns="http://www.w3.org/2000/svg">
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

      {/* Monograma "FI" em verde */}
      {/* F */}
      <rect x="58" y="49" width="19" height="95" fill={GREEN} />
      <rect x="58" y="49" width="70" height="19" fill={GREEN} />
      <rect x="58" y="86" width="52" height="18" fill={GREEN} />
      {/* I — traço inclinado que desce além do F (dinâmico) */}
      <polygon points="124,49 150,49 124,162 98,162" fill={GREEN} />
    </svg>
  );
}

// Lockup horizontal: emblema + divisória + texto. Usado no topo central.
export function LogoHorizontal({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <FiEmblem className="h-14 w-auto shrink-0" />
      <div className="w-px self-stretch my-1" style={{ backgroundColor: SLATE }} />
      <div className="flex flex-col leading-none text-left">
        <span className="text-[7px] tracking-[0.28em] font-bold uppercase" style={{ color: SLATE }}>
          Higiene Ocupacional
        </span>
        <span className="text-[22px] font-black tracking-tight leading-[0.92]" style={{ color: SLATE }}>
          FALA
        </span>
        <span className="text-[22px] font-black tracking-tight leading-[0.92]" style={{ color: SLATE }}>
          INSTRUTOR
        </span>
        <span className="text-[7px] tracking-[0.2em] font-semibold uppercase mt-0.5" style={{ color: SLATE }}>
          Segurança do Trabalho
        </span>
      </div>
    </div>
  );
}
