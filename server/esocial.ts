/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * eSocial — Evento S-2245 (Treinamentos, Capacitações e Exercícios Simulados).
 *
 * IMPORTANTE: quem transmite o evento ao eSocial é o EMPREGADOR (com o e-CNPJ
 * dele), não a escola. Esta camada apenas GERA os dados do evento (registros +
 * XML rascunho + relatório) para a empresa importar/transmitir no sistema de
 * folha/eSocial dela. O motor de dados é desacoplado do leiaute: o XML é gerado
 * a partir dos registros estruturados, então adaptar à versão vigente do
 * leiaute (S-1.x) é trivial.
 *
 * O leiaute do eSocial SST está em simplificação (o S-2245 pode migrar para
 * S-2200/S-2206 e a Tabela 29 para a 28). Por isso o XML aqui é marcado como
 * RASCUNHO e deve ser validado contra o XSD vigente antes da transmissão.
 */

import { prisma } from './db';

// De-para padrão NR (código do curso) → codTreina (Tabela 29 do eSocial).
// Valores de referência, EDITÁVEIS por curso no painel (Course.esocialCode).
// Devem ser conferidos contra a tabela vigente do eSocial antes de transmitir.
export const DEFAULT_CODTREINA: Record<string, string> = {
  'NR06': '0506', // EPI
  'NR05': '0505', // CIPA
  'NR10': '0510', // Segurança em instalações e serviços em eletricidade
  'NR11': '0511', // Transporte, movimentação, armazenagem e manuseio de materiais
  'NR12': '0512', // Segurança no trabalho em máquinas e equipamentos
  'NR18': '0518', // Construção civil
  'NR33': '0533', // Espaços confinados
  'NR35': '0535', // Trabalho em altura
};

// Resolve o codTreina de um curso: o configurado vence; senão tenta o de-para
// pelo prefixo do código (ex.: "NR35 4H" → "NR35").
export function resolveCodTreina(courseCode: string, configured: string | null): string | null {
  if (configured && configured.trim()) return configured.trim();
  const key = (courseCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  for (const nr of Object.keys(DEFAULT_CODTREINA)) {
    if (key.startsWith(nr)) return DEFAULT_CODTREINA[nr];
  }
  return null;
}

const onlyDigits = (s: string | null | undefined) => (s ?? '').replace(/\D/g, '');
const ymd = (d: Date) => d.toISOString().slice(0, 10); // AAAA-MM-DD

export interface S2245Record {
  enrollmentId: string;
  // Trabalhador
  cpfTrab: string;
  nmTrab: string;
  // Empregador
  cnpjEmpregador: string;
  // Treinamento
  courseCode: string;
  courseName: string;
  codTreina: string | null; // null = sem mapeamento → pendência
  cargaHor: number; // horas
  dtTreina: string; // data de conclusão (AAAA-MM-DD)
  // Responsável técnico (instrutor)
  respCpf: string;
  respNome: string;
  respFormacao: string;
  respRegConselho: string; // CREA/CRQ ou outro registro
  certificateCode: string | null;
  // Pendências que impedem a transmissão
  pendencias: string[];
}

// Coleta as conclusões (certificado liberado) de cursos marcados como eSocial,
// dos funcionários de uma empresa, num intervalo de datas.
export async function buildS2245Records(
  companyId: string,
  fromISO?: string,
  toISO?: string,
): Promise<{ company: { name: string; cnpj: string }; records: S2245Record[] }> {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  const from = fromISO ? new Date(fromISO) : null;
  const to = toISO ? new Date(toISO) : null;
  if (to) to.setHours(23, 59, 59, 999);

  const enrollments = await prisma.enrollment.findMany({
    where: {
      released: true,
      passed: true,
      revoked: false,
      course: { esocialEnabled: true },
      user: { companyId, role: 'STUDENT' },
      ...(from || to ? { releasedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    include: {
      user: { select: { name: true, cpf: true } },
      course: {
        select: {
          code: true, name: true, duration: true, esocialCode: true,
          instructors: { select: { name: true, cpf: true, formation: true, crea: true, crq: true }, take: 1 },
        },
      },
    },
    orderBy: { releasedAt: 'desc' },
  });

  const cnpjEmpregador = onlyDigits(company?.cnpj);
  const records: S2245Record[] = enrollments.map((e) => {
    const resp = e.course.instructors[0];
    const codTreina = resolveCodTreina(e.course.code, e.course.esocialCode ?? null);
    const respCpf = onlyDigits(resp?.cpf);
    const reg = resp?.crea || resp?.crq || '';
    const dt = e.releasedAt ?? e.startDate;

    const pendencias: string[] = [];
    if (!cnpjEmpregador || cnpjEmpregador.length !== 14) pendencias.push('CNPJ do empregador ausente/ inválido.');
    if (onlyDigits(e.user.cpf).length !== 11) pendencias.push('CPF do trabalhador ausente/ inválido.');
    if (!codTreina) pendencias.push('Curso sem codTreina (Tabela 29) configurado.');
    if (respCpf.length !== 11) pendencias.push('CPF do responsável técnico (instrutor) ausente.');

    return {
      enrollmentId: e.id,
      cpfTrab: onlyDigits(e.user.cpf),
      nmTrab: e.user.name,
      cnpjEmpregador,
      courseCode: e.course.code,
      courseName: e.course.name,
      codTreina,
      cargaHor: e.course.duration,
      dtTreina: ymd(dt),
      respCpf,
      respNome: resp?.name ?? '',
      respFormacao: resp?.formation ?? '',
      respRegConselho: reg,
      certificateCode: e.certificateCode,
      pendencias,
    };
  });

  return { company: { name: company?.name ?? '', cnpj: cnpjEmpregador }, records };
}

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Gera um XML RASCUNHO do evento S-2245 para um trabalhador (um evento por
// trabalhador, com os treinamentos do período no grupo treinamento). Segue a
// estrutura conhecida do leiaute; precisa ser validada contra o XSD vigente.
export function generateS2245Xml(
  cnpjEmpregador: string,
  cpfTrab: string,
  nmTrab: string,
  trainings: S2245Record[],
): string {
  const id = `ID1${cnpjEmpregador.padEnd(14, '0').slice(0, 14)}${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`;
  const treinos = trainings
    .map((t) => `
        <treinamento>
          <codTreina>${esc(t.codTreina ?? '')}</codTreina>
          <obsTreina>${esc(`${t.courseCode} - ${t.courseName} | CH ${t.cargaHor}h | Concluído ${t.dtTreina}${t.certificateCode ? ` | Cert. ${t.certificateCode}` : ''}`)}</obsTreina>
          <responsavel>
            <cpfResp>${esc(t.respCpf)}</cpfResp>
            <nmResp>${esc(t.respNome)}</nmResp>
            <dscResp>${esc(`${t.respFormacao}${t.respRegConselho ? ` - ${t.respRegConselho}` : ''}`)}</dscResp>
          </responsavel>
        </treinamento>`)
    .join('');

  // OBS: namespace/versão precisam refletir o leiaute vigente antes de transmitir.
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- RASCUNHO S-2245 gerado pelo FalaInstrutor. Validar contra o XSD vigente do eSocial antes de transmitir. -->
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtTreiCap/v_S_01_03_00">
  <evtTreiCap Id="${esc(id)}">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>2</tpAmb>
      <procEmi>1</procEmi>
      <verProc>FalaInstrutor</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${esc(cnpjEmpregador.slice(0, 8))}</nrInsc>
    </ideEmpregador>
    <ideVinculo>
      <cpfTrab>${esc(cpfTrab)}</cpfTrab>
    </ideVinculo>
    <treiCap>${treinos}
    </treiCap>
  </evtTreiCap>
</eSocial>`;
}

// Relatório CSV (separador ';' p/ Excel pt-BR) das conclusões eSocial.
export function recordsToCsv(records: S2245Record[]): string {
  const head = ['CPF', 'Trabalhador', 'CNPJ Empregador', 'Curso', 'codTreina', 'CargaHoraria', 'DataConclusao', 'CPF Responsavel', 'Responsavel', 'Registro', 'Certificado', 'Pendencias'];
  const rows = records.map((r) => [
    r.cpfTrab, r.nmTrab, r.cnpjEmpregador, `${r.courseCode} - ${r.courseName}`, r.codTreina ?? '',
    String(r.cargaHor), r.dtTreina, r.respCpf, r.respNome, r.respRegConselho, r.certificateCode ?? '',
    r.pendencias.join(' / '),
  ]);
  const line = (cols: string[]) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';');
  return [head, ...rows].map(line).join('\r\n');
}
