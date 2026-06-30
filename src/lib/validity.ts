/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cálculo de validade/vencimento do certificado a partir da data de liberação
 * (ou início) + a validade do curso em meses. Usado para alertas de renovação.
 */

export type ValidityStatus = 'valid' | 'expiring' | 'expired' | 'none';

export interface ValidityInfo {
  expiresAt: Date | null;
  daysLeft: number | null;
  status: ValidityStatus;
  label: string; // texto pronto para exibição
}

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

// Janela (dias) em que o certificado é considerado "a vencer".
export const EXPIRING_WINDOW_DAYS = 60;

export function certificateValidity(
  base?: string | null,
  validityMonths?: number | null,
  now: Date = new Date(),
): ValidityInfo {
  if (!base || !validityMonths || validityMonths <= 0) {
    return { expiresAt: null, daysLeft: null, status: 'none', label: '' };
  }
  const start = new Date(base.length <= 10 ? `${base}T00:00:00Z` : base);
  if (isNaN(start.getTime())) return { expiresAt: null, daysLeft: null, status: 'none', label: '' };

  const exp = new Date(start);
  exp.setUTCMonth(exp.getUTCMonth() + validityMonths);
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86_400_000);

  let status: ValidityStatus;
  let label: string;
  if (daysLeft < 0) {
    status = 'expired';
    label = `Vencido em ${fmt(exp)}`;
  } else if (daysLeft <= EXPIRING_WINDOW_DAYS) {
    status = 'expiring';
    label = `Vence em ${daysLeft} dia${daysLeft === 1 ? '' : 's'} (${fmt(exp)})`;
  } else {
    status = 'valid';
    label = `Válido até ${fmt(exp)}`;
  }
  return { expiresAt: exp, daysLeft, status, label };
}
