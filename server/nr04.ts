/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Apoio à NR-04: grau de risco a partir do CNAE principal e treinamentos
 * obrigatórios por grau de risco, além da consulta de CNPJ (BrasilAPI).
 *
 * Observações:
 * - O grau de risco oficial (NR-04, Quadro I) é definido por subclasse CNAE
 *   (~1.300 itens). Aqui usamos uma aproximação por DIVISÃO (2 primeiros
 *   dígitos do CNAE) como sugestão — o gestor/admin pode ajustar manualmente.
 * - A lista de treinamentos obrigatórios por grau é uma baseline configurável
 *   da plataforma (não substitui a análise de riscos da empresa).
 */

// Grau de risco sugerido por divisão CNAE (2 primeiros dígitos). Default = 2.
const RISK_BY_DIVISION: Record<string, number> = {
  '01': 3, '02': 3, '03': 3, // Agropecuária
  '05': 4, '06': 4, '07': 4, '08': 4, '09': 4, // Extrativas
  '10': 3, '11': 3, '12': 3, '13': 3, '14': 3, '15': 3, '16': 3, '17': 3, '18': 2, '19': 4,
  '20': 4, '21': 3, '22': 3, '23': 3, '24': 4, '25': 3, '26': 2, '27': 3, '28': 3, '29': 3,
  '30': 3, '31': 3, '32': 2, '33': 3, // Indústria de transformação
  '35': 3, '36': 3, '37': 3, '38': 3, '39': 3, // Eletricidade/água/resíduos
  '41': 3, '42': 4, '43': 3, // Construção
  '45': 2, '46': 2, '47': 2, // Comércio
  '49': 3, '50': 3, '51': 3, '52': 3, '53': 3, // Transporte/armazenagem
  '55': 2, '56': 2, // Alojamento/alimentação
  '58': 1, '59': 1, '60': 1, '61': 2, '62': 1, '63': 1, // Informação/comunicação
  '64': 1, '65': 1, '66': 1, // Financeiro
  '68': 1, // Imobiliário
  '69': 1, '70': 1, '71': 2, '72': 2, '73': 1, '74': 1, '75': 2, // Profissionais/científicas
  '77': 2, '78': 2, '79': 1, '80': 3, '81': 3, '82': 1, // Administrativas
  '84': 2, '85': 2, // Adm pública / educação
  '86': 3, '87': 3, '88': 2, // Saúde humana / serviços sociais
  '90': 2, '91': 1, '92': 2, '93': 2, '94': 1, '95': 2, '96': 2, '97': 2, '99': 1,
};

export function riskGradeForCnae(cnae?: string | null): number | null {
  if (!cnae) return null;
  const digits = cnae.replace(/\D/g, '');
  if (digits.length < 2) return null;
  return RISK_BY_DIVISION[digits.slice(0, 2)] ?? 2;
}

// Treinamentos obrigatórios (baseline) por grau de risco, cumulativos.
// Usa os códigos de curso da plataforma (ex.: "NR 35").
export const OBLIGATORY_BY_RISK: Record<number, string[]> = {
  1: ['NR 01', 'NR 05', 'NR 06'],
  2: ['NR 01', 'NR 05', 'NR 06', 'NR 23'],
  3: ['NR 01', 'NR 05', 'NR 06', 'NR 23', 'NR 17', 'NR 35'],
  4: ['NR 01', 'NR 05', 'NR 06', 'NR 23', 'NR 17', 'NR 35', 'NR 33', 'NR 20'],
};

export function obligatoryTrainings(riskGrade?: number | null): string[] {
  const g = riskGrade && riskGrade >= 1 && riskGrade <= 4 ? riskGrade : 2;
  return OBLIGATORY_BY_RISK[g];
}

// Carga horária (horas) por grau de risco, para os treinamentos cuja duração
// varia conforme o grau (NR-04). Quando o código não está aqui, usa a duração
// padrão do curso. Base: tabela de carga horária do Projeto Pedagógico.
export const WORKLOAD_BY_RISK: Record<string, Record<number, number>> = {
  'NR 05': { 1: 8, 2: 12, 3: 16, 4: 20 }, // CIPA — escala com o grau de risco
};

// Retorna a carga horária do treinamento conforme o grau de risco; cai para a
// duração padrão (defaultHours) quando o curso não varia por grau.
export function workloadForRisk(code: string, riskGrade?: number | null, defaultHours = 0): number {
  const g = riskGrade && riskGrade >= 1 && riskGrade <= 4 ? riskGrade : 2;
  return WORKLOAD_BY_RISK[code]?.[g] ?? defaultHours;
}

export interface CnpjInfo {
  cnpj: string;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  cnae: string | null;
  cnaeDescription: string | null;
  riskGrade: number | null;
}

// Consulta o CNPJ na BrasilAPI (sem dependência; usa fetch). Pode falhar se a
// política de rede do ambiente bloquear a saída — o chamador trata o erro.
export async function lookupCnpj(cnpjRaw: string): Promise<CnpjInfo> {
  const cnpj = cnpjRaw.replace(/\D/g, '');
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
