/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { questionsToCsv, csvToQuestions, parseCsv, rowsToQuestions, templateCsv } from './examCsv';
import { ExamQuestion } from '../types';

const sample: ExamQuestion[] = [
  { question: 'Qual a cor do céu?', options: ['Verde', 'Azul', 'Roxo'], correctIndex: 1 },
  { question: '2 + 2 = ?', options: ['3', '4'], correctIndex: 1 },
];

describe('examCsv', () => {
  it('faz round-trip questões -> CSV -> questões', () => {
    const csv = questionsToCsv(sample);
    const back = csvToQuestions(csv);
    expect(back).toEqual(sample);
  });

  it('ignora o cabeçalho na importação', () => {
    const csv = questionsToCsv(sample);
    expect(csvToQuestions(csv)).toHaveLength(2); // header não vira questão
  });

  it('detecta delimitador vírgula', () => {
    const csv = 'Pergunta,Alt 1,Alt 2,Correta\nQual?,Sim,Não,1';
    const qs = csvToQuestions(csv);
    expect(qs).toEqual([{ question: 'Qual?', options: ['Sim', 'Não'], correctIndex: 0 }]);
  });

  it('respeita aspas com delimitador embutido', () => {
    const rows = parseCsv('a;"b;c";d');
    expect(rows[0]).toEqual(['a', 'b;c', 'd']);
  });

  it('ignora alternativas em branco e linhas inválidas', () => {
    const rows = [
      ['Pergunta', 'A', 'B', '', 'C', '2'], // 3 opções válidas (A,B,C)
      ['', 'x', 'y', '1'], // sem enunciado -> ignorada
      ['Só uma opção', 'A', '', '1'], // <2 opções -> ignorada
    ];
    const qs = rowsToQuestions(rows);
    expect(qs).toEqual([{ question: 'Pergunta', options: ['A', 'B', 'C'], correctIndex: 1 }]);
  });

  it('limita o índice correto ao número de alternativas', () => {
    const qs = rowsToQuestions([['Q', 'A', 'B', '9']]);
    expect(qs[0].correctIndex).toBe(1); // 9 -> última opção (índice 1)
  });

  it('gera um modelo com cabeçalho e exemplos', () => {
    const tpl = templateCsv();
    expect(tpl).toContain('Pergunta');
    expect(csvToQuestions(tpl).length).toBeGreaterThanOrEqual(2);
  });
});
