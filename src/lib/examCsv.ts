/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Conversão entre o banco de questões (ExamQuestion[]) e CSV (Excel-friendly),
 * usada pelo Editor de Provas. Funções puras — testáveis isoladamente.
 *
 * Layout de cada linha: [Pergunta, Alternativa 1..N, Resposta correta (número)].
 */

import { ExamQuestion } from '../types';

export const CSV_HEADER = ['Pergunta', 'Alternativa 1', 'Alternativa 2', 'Alternativa 3', 'Alternativa 4', 'Resposta correta (numero)'];

function csvEscape(v: string): string {
  const s = String(v ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function questionsToCsv(qs: ExamQuestion[]): string {
  const maxOpts = Math.max(4, ...qs.map((q) => q.options.length));
  const header = ['Pergunta', ...Array.from({ length: maxOpts }, (_, i) => `Alternativa ${i + 1}`), 'Resposta correta (numero)'];
  const rows = qs.map((q) => {
    const opts = Array.from({ length: maxOpts }, (_, i) => q.options[i] ?? '');
    return [q.question, ...opts, String(q.correctIndex + 1)];
  });
  return '﻿' + [header, ...rows].map((r) => r.map(csvEscape).join(';')).join('\r\n');
}

export function templateCsv(): string {
  const examples = [
    ['Qual é a altura mínima considerada trabalho em altura pela NR-35?', 'Acima de 1,50 m', 'Acima de 2,00 m', 'Acima de 3,00 m', 'Acima de 5,00 m', '2'],
    ['O EPI deve ser inspecionado antes do uso?', 'Sim, sempre', 'Não é necessário', 'Apenas se for novo', 'Somente uma vez por ano', '1'],
  ];
  return '﻿' + [CSV_HEADER, ...examples].map((r) => r.map(csvEscape).join(';')).join('\r\n');
}

// Parser de CSV que respeita aspas e detecta o delimitador (";" ou ",").
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, '');
  const firstLine = clean.split('\n')[0];
  const delim = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delim) { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

// Converte linhas (matriz de células) em questões. Reaproveitado por CSV e XLSX.
export function rowsToQuestions(rows: (string | number | null | undefined)[][]): ExamQuestion[] {
  const out: ExamQuestion[] = [];
  for (const raw of rows) {
    const r = raw.map((c) => (c == null ? '' : String(c)));
    if (r.length < 3) continue;
    const question = (r[0] ?? '').trim();
    const correctRaw = (r[r.length - 1] ?? '').trim();
    const correctNum = parseInt(correctRaw, 10);
    if (!question || Number.isNaN(correctNum)) continue; // ignora cabeçalho/linhas inválidas
    const options = r.slice(1, r.length - 1).map((o) => o.trim()).filter((o) => o.length > 0);
    if (options.length < 2) continue;
    const correctIndex = Math.min(Math.max(correctNum - 1, 0), options.length - 1);
    out.push({ question, options, correctIndex });
  }
  return out;
}

export function csvToQuestions(text: string): ExamQuestion[] {
  return rowsToQuestions(parseCsv(text));
}
