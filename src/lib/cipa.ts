/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Regra de carga horária do treinamento da CIPA (NR-5), por grau de risco.
 *
 * Com as atualizações da NR-5 (alinhadas ao Anexo II da NR-1), o treinamento da
 * CIPA pode ser semipresencial (híbrido). Para empresas de maior risco (graus 3
 * e 4), parte da carga horária é obrigatoriamente PRESENCIAL.
 *
 *  Grau 1 e 2: 8h (pode ser totalmente EaD)
 *  Grau 3:     16h — mínimo 8h presencial + 8h EaD
 *  Grau 4:     20h — mínimo 8h presencial + 12h EaD
 */

export interface CipaRequirement {
  grade: number;
  total: number;       // carga horária total (h)
  presencial: number;  // tempo mínimo presencial (h)
  ead: number;         // tempo que pode ser EaD (h)
}

export const CIPA_NR5_BY_GRADE: Record<number, CipaRequirement> = {
  1: { grade: 1, total: 8, presencial: 0, ead: 8 },
  2: { grade: 2, total: 8, presencial: 0, ead: 8 },
  3: { grade: 3, total: 16, presencial: 8, ead: 8 },
  4: { grade: 4, total: 20, presencial: 8, ead: 12 },
};

export function cipaRequirement(grade?: number | null): CipaRequirement | null {
  if (!grade || grade < 1 || grade > 4) return null;
  return CIPA_NR5_BY_GRADE[grade];
}
