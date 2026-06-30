/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * eSocial — Evento S-2245 (Treinamentos, Capacitações e Exercícios Simulados).
 *
 * IMPORTANTE: quem transmite o evento ao eSocial é o EMPREGADOR (com o e-CNPJ
 * dele), não a escola. Esta camada apenas GERA os dados do evento (registros +
 * XML + relatório) para a empresa importar/transmitir no sistema de
 * folha/eSocial dela. Quem assina e envia é o empregador.
 *
 * LEIAUTE-ALVO: v02_05_00 — namespace
 *   http://www.esocial.gov.br/schema/evt/evtTreiCap/v02_05_00
 * O XML aqui é validado tag-a-tag contra o XSD oficial do evtTreiCap
 * (v02_05_00), mas NÃO é assinado: o elemento <Signature> (ds:Signature) é
 * OBRIGATÓRIO e deve ser anexado pelo empregador na transmissão. Por isso o
 * arquivo é um RASCUNHO pronto-para-assinar.
 *
 * OBS: o S-2245 foi DESCONTINUADO no leiaute simplificado (S-1.3); v02_05_00 é
 * a versão mais recente em que o evtTreiCap existe. Confirme com o receptor
 * eSocial do empregador qual leiaute ele ainda aceita para o S-2245.
 */

import { prisma } from './db';

export const ESOCIAL_NS = 'http://www.esocial.gov.br/schema/evt/evtTreiCap/v02_05_00';

// De-para padrão NR (código do curso) → codTreiCap (Tabela 29 do eSocial).
// ATENÇÃO: valores de REFERÊNCIA (4 dígitos). Conferir contra a Tabela 29
// vigente antes de transmitir — são editáveis por curso (Course.esocialCode).
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

// CBO padrão quando o responsável não tem CBO cadastrado (Técnico de Segurança
// do Trabalho). NÃO é usado no XML: a falta de CBO vira pendência (bloqueia).
export const DEFAULT_CBO_HINT = '351505';

// Resolve o codTreiCap de um curso: o configurado vence; senão tenta o de-para
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
// Data-calendário (AAAA-MM-DD) no fuso de Brasília — evita o "pula um dia"
// quando releasedAt cai à noite (UTC do dia seguinte).
const ymd = (d: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
  return parts; // en-CA já formata como AAAA-MM-DD
};

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
  codTreiCap: string | null; // null = sem mapeamento → pendência
  durTreiCap: number; // carga horária (horas)
  dtTreiCap: string; // data de conclusão (AAAA-MM-DD)
  // Responsável técnico (ideProfResp)
  cpfProf: string; // opcional no leiaute
  nmProf: string;
  formProf: string;
  codCBO: string;
  certificateCode: string | null;
  // Pendências que impedem a transmissão (XML conformante)
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
          instructors: { select: { name: true, cpf: true, codCBO: true, formation: true, crea: true, crq: true }, orderBy: { name: 'asc' }, take: 1 },
        },
      },
    },
    orderBy: { releasedAt: 'desc' },
  });

  const cnpjEmpregador = onlyDigits(company?.cnpj);
  const records: S2245Record[] = enrollments.map((e) => {
    const resp = e.course.instructors[0];
    const codTreiCap = resolveCodTreina(e.course.code, e.course.esocialCode ?? null);
    const cpfProf = onlyDigits(resp?.cpf);
    const codCBO = onlyDigits(resp?.codCBO);
    const reg = resp?.crea || resp?.crq || '';
    // formProf inclui a formação + registro de conselho (2–255 chars).
    const formProf = [resp?.formation ?? '', reg].filter(Boolean).join(' - ');
    const dt = e.releasedAt ?? e.startDate;

    const pendencias: string[] = [];
    if (cnpjEmpregador.length !== 14) pendencias.push('CNPJ do empregador ausente/inválido.');
    if (onlyDigits(e.user.cpf).length !== 11) pendencias.push('CPF do trabalhador ausente/inválido.');
    if (!codTreiCap) pendencias.push('Curso sem codTreiCap (Tabela 29) configurado.');
    if (!resp || !resp.name) pendencias.push('Treinamento sem responsável técnico (instrutor).');
    if (formProf.length < 2) pendencias.push('Formação do responsável ausente.');
    if (codCBO.length !== 6) pendencias.push(`CBO do responsável ausente/inválido (6 dígitos). Cadastre no instrutor (sugestão: ${DEFAULT_CBO_HINT}).`);
    // cpfProf é OPCIONAL no leiaute: só vira pendência se preenchido e inválido.
    if (cpfProf && cpfProf.length !== 11) pendencias.push('CPF do responsável inválido.');

    return {
      enrollmentId: e.id,
      cpfTrab: onlyDigits(e.user.cpf),
      nmTrab: e.user.name,
      cnpjEmpregador,
      courseCode: e.course.code,
      courseName: e.course.name,
      codTreiCap,
      durTreiCap: e.course.duration,
      dtTreiCap: ymd(dt),
      cpfProf,
      nmProf: resp?.name ?? '',
      formProf,
      codCBO,
      certificateCode: e.certificateCode,
      pendencias,
    };
  });

  return { company: { name: company?.name ?? '', cnpj: cnpjEmpregador }, records };
}

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (s: string, n: number) => s.padStart(n, '0').slice(-n);

// Id do evento (xs:ID): "ID" + tpInsc(1) + nrInsc(14) + AAAAMMDDHHMMSS(14) + seq(5).
function buildEventId(cnpjEmpregador: string, seq: number): string {
  const ts = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  return `ID1${pad(cnpjEmpregador, 14)}${ts}${pad(String(seq), 5)}`;
}

// Gera UM evento evtTreiCap (um treinamento por evento — treiCap é maxOccurs=1
// no XSD v02_05_00) conforme o leiaute. SEM assinatura (rascunho); o empregador
// deve anexar <Signature> antes de transmitir.
export function generateS2245Event(r: S2245Record, seq: number): string {
  const nrInsc = pad(r.cnpjEmpregador, 14).slice(0, 8); // CNPJ empregador: raiz (8 díg.)
  const obs = `${r.courseCode} - ${r.courseName} | CH ${r.durTreiCap}h${r.certificateCode ? ` | Cert. ${r.certificateCode}` : ''}`.slice(0, 999);
  const cpfProfTag = r.cpfProf.length === 11 ? `\n          <cpfProf>${esc(r.cpfProf)}</cpfProf>` : '';
  return `  <evtTreiCap Id="${esc(buildEventId(r.cnpjEmpregador, seq))}">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>2</tpAmb>
      <procEmi>1</procEmi>
      <verProc>FalaInstrutor</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${esc(nrInsc)}</nrInsc>
    </ideEmpregador>
    <ideVinculo>
      <cpfTrab>${esc(r.cpfTrab)}</cpfTrab>
    </ideVinculo>
    <treiCap>
      <codTreiCap>${esc(r.codTreiCap ?? '')}</codTreiCap>
      <obsTreiCap>${esc(obs)}</obsTreiCap>
      <infoComplem>
        <dtTreiCap>${esc(r.dtTreiCap)}</dtTreiCap>
        <durTreiCap>${esc(String(r.durTreiCap))}</durTreiCap>
        <indTreinAnt>N</indTreinAnt>
        <ideProfResp>${cpfProfTag}
          <nmProf>${esc(r.nmProf).slice(0, 70)}</nmProf>
          <tpProf>2</tpProf>
          <formProf>${esc(r.formProf).slice(0, 255)}</formProf>
          <codCBO>${esc(r.codCBO)}</codCBO>
          <nacProf>1</nacProf>
        </ideProfResp>
      </infoComplem>
    </treiCap>
  </evtTreiCap>
  <!-- ATENÇÃO: anexar aqui o <Signature> (ds:Signature) — obrigatório na transmissão. -->`;
}

// Gera o lote de eventos (um por registro transmissível) num envelope simples.
// NÃO é o lote oficial de envio (esse exige eventos assinados); é o conjunto de
// rascunhos prontos para o empregador assinar e enviar.
export function generateS2245Xml(records: S2245Record[]): string {
  const ok = records.filter((r) => r.pendencias.length === 0);
  const events = ok.map((r, i) => generateS2245Event(r, i + 1)).join('\n');
  const omitidos = records.length - ok.length;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${ok.length} evento(s) S-2245 (evtTreiCap v02_05_00) — RASCUNHO sem assinatura. -->
<!-- ${omitidos} registro(s) com pendência foram omitidos. Validar contra o XSD e ASSINAR antes de transmitir. -->
<eSocialRascunho xmlns="${ESOCIAL_NS}">
${events}
</eSocialRascunho>`;
}

// Relatório CSV (separador ';' p/ Excel pt-BR) das conclusões eSocial.
export function recordsToCsv(records: S2245Record[]): string {
  const head = ['CPF Trabalhador', 'Trabalhador', 'CNPJ Empregador', 'Curso', 'codTreiCap', 'CargaHoraria', 'DataConclusao', 'CPF Responsavel', 'Responsavel', 'CBO', 'Formacao', 'Certificado', 'Pendencias'];
  const rows = records.map((r) => [
    r.cpfTrab, r.nmTrab, r.cnpjEmpregador, `${r.courseCode} - ${r.courseName}`, r.codTreiCap ?? '',
    String(r.durTreiCap), r.dtTreiCap, r.cpfProf, r.nmProf, r.codCBO, r.formProf, r.certificateCode ?? '',
    r.pendencias.join(' / '),
  ]);
  const line = (cols: string[]) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';');
  return [head, ...rows].map(line).join('\r\n');
}
