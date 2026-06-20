/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Consulta de CNPJ direto do navegador (BrasilAPI, com CORS). Feito no client
 * porque a saída de rede do servidor pode estar bloqueada por allowlist — o
 * navegador do usuário não tem essa restrição. Também calcula o grau de risco
 * sugerido (NR-04) a partir da divisão do CNAE.
 */

export interface CnpjInfo {
  cnpj: string;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  cnae: string | null;
  cnaeDescription: string | null;
  riskGrade: number | null;
}

// Grau de risco sugerido por divisão CNAE (2 primeiros dígitos). Default = 2.
const RISK_BY_DIVISION: Record<string, number> = {
  '01': 3, '02': 3, '03': 3,
  '05': 4, '06': 4, '07': 4, '08': 4, '09': 4,
  '10': 3, '11': 3, '12': 3, '13': 3, '14': 3, '15': 3, '16': 3, '17': 3, '18': 2, '19': 4,
  '20': 4, '21': 3, '22': 3, '23': 3, '24': 4, '25': 3, '26': 2, '27': 3, '28': 3, '29': 3,
  '30': 3, '31': 3, '32': 2, '33': 3,
  '35': 3, '36': 3, '37': 3, '38': 3, '39': 3,
  '41': 3, '42': 4, '43': 3,
  '45': 2, '46': 2, '47': 2,
  '49': 3, '50': 3, '51': 3, '52': 3, '53': 3,
  '55': 2, '56': 2,
  '58': 1, '59': 1, '60': 1, '61': 2, '62': 1, '63': 1,
  '64': 1, '65': 1, '66': 1,
  '68': 1,
  '69': 1, '70': 1, '71': 2, '72': 2, '73': 1, '74': 1, '75': 2,
  '77': 2, '78': 2, '79': 1, '80': 3, '81': 3, '82': 1,
  '84': 2, '85': 2,
  '86': 3, '87': 3, '88': 2,
  '90': 2, '91': 1, '92': 2, '93': 2, '94': 1, '95': 2, '96': 2, '97': 2, '99': 1,
};

export function riskGradeForCnae(cnae?: string | null): number | null {
  if (!cnae) return null;
  const digits = cnae.replace(/\D/g, '');
  if (digits.length < 2) return null;
  return RISK_BY_DIVISION[digits.slice(0, 2)] ?? 2;
}

export async function lookupCnpjClient(cnpjRaw: string): Promise<CnpjInfo> {
  const cnpj = (cnpjRaw || '').replace(/\D/g, '');
  if (cnpj.length !== 14) throw new Error('CNPJ inválido (14 dígitos).');
  const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    headers: { Accept: 'application/json' },
  });
  if (!resp.ok) throw new Error('Não foi possível consultar o CNPJ.');
  const data: any = await resp.json();
  const cnae = data.cnae_fiscal ? String(data.cnae_fiscal) : null;
  return {
    cnpj,
    razaoSocial: data.razao_social ?? null,
    nomeFantasia: data.nome_fantasia ?? null,
    cnae,
    cnaeDescription: data.cnae_fiscal_descricao ?? null,
    riskGrade: riskGradeForCnae(cnae),
  };
}
