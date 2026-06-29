// Gera capas SVG temáticas para cada treinamento em public/covers/<id>.svg.
// Identidade FalaInstrutor: base navy + acento por categoria, código da NR,
// título curto e um ícone temático (emoji). Leve e sem dependência externa.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'public', 'covers');
mkdirSync(OUT, { recursive: true });

const NAVY = '#18243A';
const NAVY2 = '#0F1726';

// [id, código, título curto, emoji, cor de acento]
const COURSES = [
  ['course-nr01', 'NR 01', 'Integração de Segurança do Trabalho', '🦺', '#27B074'],
  ['course-nr05', 'NR 05', 'CIPA — Prevenção de Acidentes', '🤝', '#27B074'],
  ['course-nr06', 'NR 06', 'Equipamentos de Proteção Individual', '🧤', '#F5B21A'],
  ['course-nr10', 'NR 10', 'Segurança em Eletricidade e SEP', '⚡', '#F5B21A'],
  ['course-nr11', 'NR 11', 'Movimentação e Transporte de Materiais', '🚚', '#3B82F6'],
  ['course-nr12', 'NR 12', 'Segurança em Máquinas e Equipamentos', '⚙️', '#64748B'],
  ['course-nr13', 'NR 13', 'Caldeiras e Vasos de Pressão', '🛢️', '#EF4444'],
  ['course-nr17', 'NR 17', 'Ergonomia', '🪑', '#14B8A6'],
  ['course-nr18', 'NR 18', 'Segurança na Construção Civil', '🏗️', '#F5B21A'],
  ['course-nr20', 'NR 20', 'Inflamáveis e Combustíveis', '🛢️', '#F97316'],
  ['course-nr23', 'NR 23', 'Proteção Contra Incêndios', '🧯', '#EF4444'],
  ['course-nr31', 'NR 31', 'Segurança no Trabalho Rural', '🌾', '#22C55E'],
  ['course-nr33', 'NR 33', 'Espaços Confinados', '🪖', '#0EA5E9'],
  ['course-nr35', 'NR 35', 'Trabalho em Altura', '🪜', '#3B82F6'],
  ['course-nr38', 'NR 38', 'Limpeza Urbana e Resíduos Sólidos', '♻️', '#27B074'],
  ['course-incompat-quimica', 'IQ', 'Incompatibilidade Química', '⚗️', '#A855F7'],
  ['course-class-rotulagem', 'GHS', 'Rotulagem de Produtos Químicos', '🏷️', '#F59E0B'],
  ['course-quimicos-controlados', 'PQC', 'Produtos Químicos Controlados', '☣️', '#EAB308'],
  ['course-leilucas-4', 'LEI LUCAS', 'Primeiros Socorros — 4h', '⛑️', '#EF4444'],
  ['course-leilucas-10', 'LEI LUCAS', 'Primeiros Socorros — 10h', '🚑', '#DC2626'],
];

// quebra o título em até 2 linhas (~26 chars/linha)
function wrap(text, max = 26) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur.trim());
  return lines.slice(0, 2);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg(id, code, title, emoji, accent) {
  const lines = wrap(title);
  const titleSvg = lines
    .map((l, i) => `<text x="40" y="${272 + i * 26}" font-family="'Segoe UI',Roboto,Arial,sans-serif" font-size="19" font-weight="600" fill="#E5EAF2">${esc(l)}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" role="img" aria-label="${esc(code)} — ${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY2}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="600" height="350" fill="url(#bg)"/>
  <circle cx="500" cy="70" r="150" fill="${accent}" opacity="0.10"/>
  <circle cx="560" cy="300" r="90" fill="${accent}" opacity="0.08"/>
  <rect x="0" y="0" width="10" height="350" fill="url(#accent)"/>
  <text x="40" y="58" font-family="'Segoe UI',Roboto,Arial,sans-serif" font-size="17" font-weight="700" fill="#FFFFFF" opacity="0.92">⛑ FalaInstrutor</text>
  <text x="40" y="78" font-family="'Segoe UI',Roboto,Arial,sans-serif" font-size="11" letter-spacing="1.5" fill="${accent}" font-weight="600">TREINAMENTO SST</text>
  <text x="478" y="205" font-size="140" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  <text x="40" y="210" font-family="'Segoe UI',Roboto,Arial,sans-serif" font-size="${code.length > 6 ? 44 : 64}" font-weight="800" fill="#FFFFFF">${esc(code)}</text>
  ${titleSvg}
  <rect x="40" y="300" width="46" height="4" rx="2" fill="${accent}"/>
</svg>`;
}

let n = 0;
for (const [id, code, title, emoji, accent] of COURSES) {
  writeFileSync(resolve(OUT, `${id}.svg`), svg(id, code, title, emoji, accent), 'utf8');
  n++;
}
console.log(`Geradas ${n} capas em public/covers/`);
