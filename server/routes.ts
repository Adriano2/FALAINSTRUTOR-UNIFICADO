/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Rotas de recursos da API. Fase 1 estabelece o padrão (leitura pública do
 * catálogo, dados do próprio aluno, validação de certificado e um exemplo de
 * rota protegida por papel de administrador). As demais operações serão
 * migradas na Fase 2.
 */

import { Router, type Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { authenticate, authorize, type AuthedRequest } from './auth';
import { getSignerInfo, signPayload, isIcpConfigured, extractPfx, signWithKey } from './icp';
import { decryptSecret, electronicSign } from './crypto';
import { sendLeadNotification } from './email';
import { sendLeadWhatsApp } from './whatsapp';
import { evaluateUserAccess } from './accessSchedule';
import { lookupCnpj } from './nr04';

export const apiRouter = Router();

// --- Consulta de CNPJ (razão social + CNAE + grau de risco NR-04) ---
// Feita no servidor (a VPS tem saída de rede e não sofre CORS). O cliente
// usa esta rota primeiro e cai para a BrasilAPI direta apenas se ela falhar.
apiRouter.get('/cnpj/:cnpj', async (req, res) => {
  try {
    const info = await lookupCnpj(req.params.cnpj);
    res.json(info);
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Não foi possível consultar o CNPJ.' });
  }
});

// Branding white-label por subdomínio (público). Retorna a marca do parceiro
// ativo para aquele slug, ou null (usa a marca padrão FalaInstrutor).
apiRouter.get('/branding/:slug', async (req, res) => {
  const slug = req.params.slug.toLowerCase().trim();
  const p = await prisma.partner.findFirst({ where: { slug, isActive: true } });
  if (!p) return res.json({ partner: null });
  res.json({
    partner: {
      slug: p.slug, name: p.name, logoUrl: p.logoUrl, faviconUrl: p.faviconUrl,
      primaryColor: p.primaryColor, secondaryColor: p.secondaryColor,
      whatsappNumber: p.whatsappNumber, email: p.email, phone: p.phone,
    },
  });
});

// Planos de assinatura corporativa (públicos, ativos).
apiRouter.get('/plans', async (_req, res) => {
  const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  res.json({ plans });
});

apiRouter.get('/job-roles', async (_req, res) => {
  const jobRoles = await prisma.jobRole.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  res.json({ jobRoles });
});

// --- Catálogo público ---

// Projeção PÚBLICA do instrutor: NUNCA expõe dados sensíveis (CPF, CBO, e o
// material/assinatura do certificado digital cifrado) no catálogo anônimo.
const publicInstructorInclude = {
  instructors: {
    select: { id: true, name: true, formation: true, mte: true, crea: true, crq: true, signatureUrl: true, icpEnabled: true },
  },
} as const;

apiRouter.get('/courses', async (_req, res) => {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: publicInstructorInclude,
    orderBy: { code: 'asc' },
  });
  res.json({ courses });
});

apiRouter.get('/courses/:id', async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: publicInstructorInclude,
  });
  if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });
  res.json({ course });
});

// --- Exemplo de rota protegida (apenas admin pode criar curso) ---

const courseSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().default(''),
  duration: z.number().int().positive(),
  price: z.number().nonnegative(),
  coverImage: z.string().optional(),
  isFeatured: z.boolean().optional(),
  modules: z.array(z.string()).default([]),
  manualActivities: z.array(z.string()).default([]),
});

apiRouter.post(
  '/courses',
  authenticate,
  authorize('ADMIN'),
  async (req: AuthedRequest, res: Response) => {
    const parsed = courseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    }
    const course = await prisma.course.create({
      data: parsed.data as Prisma.CourseCreateInput,
    });
    res.status(201).json({ course });
  },
);

// --- Dados do próprio aluno autenticado ---

const enrollInclude = { course: { include: { instructors: true } } } as const;

apiRouter.get('/enrollments/me', authenticate, async (req: AuthedRequest, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user!.sub },
    include: enrollInclude,
    orderBy: { enrolledAt: 'desc' },
  });
  res.json({ enrollments });
});

// Matricula o aluno autenticado em um curso (ponte até o pagamento real).
apiRouter.post('/enrollments', authenticate, async (req: AuthedRequest, res: Response) => {
  const parsed = z.object({ courseId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Curso inválido.' });
  }
  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user!.sub, courseId: course.id } },
    include: enrollInclude,
  });
  if (existing) return res.json({ enrollment: existing });

  const enrollment = await prisma.enrollment.create({
    data: { userId: req.user!.sub, courseId: course.id },
    include: enrollInclude,
  });
  res.status(201).json({ enrollment });
});

// Atualiza o progresso (0-100) de uma matrícula do próprio aluno.
apiRouter.patch('/enrollments/:id/progress', authenticate, async (req: AuthedRequest, res: Response) => {
  const parsed = z.object({ progress: z.number().int().min(0).max(100) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Progresso inválido.' });

  const enr = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
  if (!enr || enr.userId !== req.user!.sub) {
    return res.status(404).json({ error: 'Matrícula não encontrada.' });
  }
  const enrollment = await prisma.enrollment.update({
    where: { id: enr.id },
    data: { progress: parsed.data.progress },
    include: enrollInclude,
  });
  res.json({ enrollment });
});

// Verifica se o aluno pode acessar os treinamentos AGORA (restrição de horário
// definida pela empresa). O front bloqueia a sala de aula quando não permitido.
apiRouter.get('/enrollments/access-window', authenticate, async (req: AuthedRequest, res: Response) => {
  const result = await evaluateUserAccess(req.user!.sub);
  res.json(result);
});

// Heartbeat de estudo: acumula o tempo assistido (minutagem para auditoria) e
// registra o primeiro acesso à sala de aula. Enviado periodicamente pelo aluno.
apiRouter.post('/enrollments/:id/study', authenticate, async (req: AuthedRequest, res: Response) => {
  const parsed = z.object({ seconds: z.number().int().min(1).max(300) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Tempo inválido.' });
  const access = await evaluateUserAccess(req.user!.sub);
  if (!access.allowed) return res.status(403).json({ error: access.message ?? 'Acesso fora do horário permitido.' });
  const enr = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
  if (!enr || enr.userId !== req.user!.sub) return res.status(404).json({ error: 'Matrícula não encontrada.' });
  await prisma.enrollment.update({
    where: { id: enr.id },
    data: {
      watchedSeconds: { increment: parsed.data.seconds },
      firstAccessAt: enr.firstAccessAt ?? new Date(),
    },
  });
  res.json({ ok: true });
});

// Marca o início da prova (auditoria do tempo até a finalização).
apiRouter.post('/enrollments/:id/exam-start', authenticate, async (req: AuthedRequest, res: Response) => {
  const access = await evaluateUserAccess(req.user!.sub);
  if (!access.allowed) return res.status(403).json({ error: access.message ?? 'Acesso fora do horário permitido.' });
  const enr = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
  if (!enr || enr.userId !== req.user!.sub) return res.status(404).json({ error: 'Matrícula não encontrada.' });
  if (!enr.examStartedAt) {
    await prisma.enrollment.update({ where: { id: enr.id }, data: { examStartedAt: new Date() } });
  }
  res.json({ ok: true });
});

// Aproveitamento mínimo exigido para aprovação (portaria).
const PASS_THRESHOLD = 75;

// Submete o exame final. O aluno envia apenas as respostas; quando a prova do
// curso está cadastrada no banco, o SERVIDOR corrige (autoritativo) e ignora
// qualquer nota enviada pelo cliente. O certificado é gerado, porém só se torna
// VÁLIDO após a liberação do instrutor (campo released).
apiRouter.post('/enrollments/:id/exam', authenticate, async (req: AuthedRequest, res: Response) => {
  const parsed = z
    .object({
      // Aceitos por compatibilidade, mas só usados como fallback quando o curso
      // não tem a prova cadastrada no banco (sem gabarito para corrigir).
      score: z.number().int().min(0).max(100).optional(),
      passed: z.boolean().optional(),
      answers: z.record(z.string(), z.number()).default({}),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do exame inválidos.' });

  const access = await evaluateUserAccess(req.user!.sub);
  if (!access.allowed) return res.status(403).json({ error: access.message ?? 'Acesso fora do horário permitido.' });

  const enr = await prisma.enrollment.findUnique({
    where: { id: req.params.id },
    include: { course: true, user: true },
  });
  if (!enr || enr.userId !== req.user!.sub) {
    return res.status(404).json({ error: 'Matrícula não encontrada.' });
  }

  const { answers } = parsed.data;

  // Gabarito da prova cadastrado no painel (autoritativo).
  const questions = Array.isArray(enr.course.examQuestions)
    ? (enr.course.examQuestions as Array<{ correctIndex: number }>)
    : [];

  let score: number;
  let passed: boolean;
  if (questions.length > 0) {
    // Correção no servidor: compara as respostas com o gabarito.
    let correct = 0;
    questions.forEach((q, i) => {
      const chosen = answers[String(i)];
      if (typeof chosen === 'number' && chosen === q.correctIndex) correct += 1;
    });
    score = Math.round((correct / questions.length) * 100);
    passed = score >= PASS_THRESHOLD;
  } else {
    // Curso sem prova cadastrada no banco: usa a nota do cliente (degradado).
    score = parsed.data.score ?? 0;
    passed = parsed.data.passed ?? false;
  }

  // Gera o código do certificado no servidor (autoritativo). O certificado fica
  // PENDENTE de liberação do instrutor (released=false) até ser homologado.
  let certificateCode = enr.certificateCode;
  if (passed && !certificateCode) {
    const firstName = (enr.user.name.split(' ')[0] || 'ALUNO').toUpperCase();
    const code = enr.course.code.replace(/\s+/g, '');
    certificateCode = `CERT-${code}-${firstName}-${Math.floor(Math.random() * 899 + 100)}`;
  }

  const enrollment = await prisma.enrollment.update({
    where: { id: enr.id },
    data: {
      examScore: score,
      passed,
      progress: 100,
      certificateCode: passed ? certificateCode : null,
      // Nova submissão zera a liberação anterior: precisa ser homologada de novo.
      released: false,
      releasedAt: null,
      examFinishedAt: new Date(), // auditoria: hora de finalização da prova
    },
    include: enrollInclude,
  });

  await prisma.examSubmission.create({
    data: {
      userId: enr.userId,
      courseId: enr.courseId,
      score,
      passed,
      answers: answers as Prisma.InputJsonValue,
    },
  });

  // O e-mail de certificado NÃO é enviado aqui: ele sai quando o instrutor
  // liberar a prova (ver server/instructor.ts).
  res.json({ enrollment, pendingRelease: passed });
});

// --- Conteúdo editável do site (público para leitura) ---
apiRouter.get('/content/:key', async (req, res) => {
  const row = await prisma.siteContent.findUnique({ where: { key: req.params.key } });
  res.json({ key: req.params.key, data: row?.data ?? [] });
});

// --- Validação pública de certificado ---

apiRouter.get('/certificates/:code', async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const enrollment = await prisma.enrollment.findFirst({
    where: { certificateCode: code, passed: true },
    include: { user: true, course: { include: { instructors: true } } },
  });
  if (!enrollment) {
    return res.status(404).json({ valid: false, error: 'Certificado não encontrado.' });
  }
  // Certificado REVOGADO definitivamente pelo administrador: inválido.
  if (enrollment.revoked) {
    return res.status(200).json({
      valid: false,
      revoked: true,
      error: 'Certificado REVOGADO. Esta credencial foi cancelada e não é mais válida.',
    });
  }
  // O certificado só é válido publicamente após a liberação (homologação) do
  // instrutor responsável pela prova.
  if (!enrollment.released) {
    return res.status(200).json({
      valid: false,
      pending: true,
      error: 'Certificado aguardando liberação do instrutor.',
    });
  }
  const instructor = enrollment.course.instructors[0];

  const cfg = await prisma.appConfig.findUnique({ where: { id: 'singleton' } });
  const payment = (cfg?.payment ?? {}) as Record<string, unknown>;

  const canonical = [
    enrollment.certificateCode,
    enrollment.user.name,
    enrollment.user.cpf,
    enrollment.course.code,
    enrollment.startDate,
  ].join('|');

  // Bloco de assinatura — prioriza o certificado digital DO INSTRUTOR responsável:
  //   1) .pfx ICP-Brasil do instrutor → assinatura criptográfica RSA com a sua chave;
  //   2) identidade do instrutor (sem .pfx) → assinatura ELETRÔNICA (HMAC, MP 2.200-2);
  //   3) fallback: certificado global (env) ou identidade do painel.
  let digitalSignature: Record<string, unknown> | null = null;

  if (instructor?.digitalCertPfx && instructor.digitalCertPassword) {
    const pfxB64 = decryptSecret(instructor.digitalCertPfx);
    const pwd = decryptSecret(instructor.digitalCertPassword);
    const extracted = pfxB64 && pwd ? extractPfx(Buffer.from(pfxB64, 'base64'), pwd) : null;
    if (extracted) {
      const sig = signWithKey(extracted.key, canonical);
      digitalSignature = {
        type: 'ICP-Brasil',
        holder: instructor.digitalCertHolder || extracted.info.holder,
        certificateName: null,
        issuer: instructor.digitalCertIssuer || extracted.info.issuer,
        serial: instructor.digitalCertSerial || extracted.info.serial,
        validUntil: instructor.digitalCertValidUntil || extracted.info.validUntil,
        icpVerified: true,
        algorithm: sig.algorithm,
        signature: sig.signature,
      };
    }
  }

  // Assinatura eletrônica do instrutor (identidade cadastrada, sem .pfx).
  if (!digitalSignature && instructor?.icpEnabled) {
    digitalSignature = {
      type: 'Eletrônica',
      holder: instructor.digitalCertHolder || instructor.name,
      certificateName: null,
      issuer: instructor.digitalCertIssuer || 'Assinatura eletrônica (MP 2.200-2/2001)',
      serial: instructor.digitalCertSerial || null,
      validUntil: instructor.digitalCertValidUntil || null,
      icpVerified: false,
      algorithm: 'HMAC-SHA256',
      signature: electronicSign(canonical),
    };
  }

  // Fallback: certificado global (variáveis de ambiente) ou identidade do painel.
  if (!digitalSignature) {
    const signer = getSignerInfo();
    const sig = signPayload(canonical);
    digitalSignature = {
      type: isIcpConfigured() ? 'ICP-Brasil' : 'Eletrônica',
      holder: signer?.holder || (payment.digitalCertificateHolder as string) || instructor?.name || 'Instrutor Qualificado',
      certificateName: (payment.digitalCertificateName as string) || null,
      issuer: signer?.issuer || (payment.digitalCertificateIssuer as string) || 'ICP-Brasil',
      serial: signer?.serial || (payment.digitalCertificateSerial as string) || null,
      validUntil: signer?.validUntil || (payment.digitalCertificateValidUntil as string) || null,
      icpVerified: isIcpConfigured(),
      algorithm: sig?.algorithm || (isIcpConfigured() ? null : 'HMAC-SHA256'),
      signature: sig?.signature || (isIcpConfigured() ? null : electronicSign(canonical)),
    };
  }

  // Validade do certificado: base (liberação ou início) + validade do curso.
  const validityMonths = enrollment.course.validityMonths ?? null;
  const validBase = enrollment.releasedAt ?? enrollment.startDate;
  let validUntil: string | null = null;
  let expired = false;
  if (validBase && validityMonths && validityMonths > 0) {
    const exp = new Date(validBase);
    exp.setMonth(exp.getMonth() + validityMonths);
    validUntil = exp.toISOString();
    expired = exp.getTime() < Date.now();
  }

  res.json({
    valid: true,
    certificate: {
      code: enrollment.certificateCode,
      studentName: enrollment.user.name,
      studentCpf: enrollment.user.cpf,
      studentDob: enrollment.user.dob ?? 'Não cadastrada',
      courseName: enrollment.course.name,
      courseCode: enrollment.course.code,
      workload: enrollment.course.duration,
      completionDate: enrollment.startDate,
      validityMonths,
      validUntil,
      expired,
      instructor: instructor?.name ?? 'Instrutor Qualificado',
      instructorFormation: instructor?.formation ?? 'Engenheiro de Segurança / Civil',
      instructorMte: instructor?.mte ?? null,
      instructorCrea: instructor?.crea ?? null,
      manualActivities: enrollment.course.manualActivities ?? [],
      digitalSignature,
    },
  });
});

// --- Captação de leads (landing de divulgação + agente de IA) ---

const leadSchema = z.object({
  type: z.enum(['PERSON', 'COMPANY']).default('PERSON'),
  name: z.string().min(2, 'Informe o nome.'),
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  cnpj: z.string().max(20).optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  interest: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(40).optional(),
});

// Cria um lead (público). Exige ao menos um contato (e-mail ou telefone).
export async function createLeadFromInput(input: unknown) {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' as string };
  const d = parsed.data;
  if (!d.email && !d.phone) return { error: 'Informe um e-mail ou telefone para contato.' };
  const lead = await prisma.lead.create({
    data: {
      type: d.type,
      name: d.name.trim(),
      email: d.email ? d.email.toLowerCase().trim() : null,
      phone: d.phone?.trim() || null,
      company: d.company?.trim() || null,
      cnpj: d.cnpj?.replace(/\D/g, '') || null,
      employeeCount: d.employeeCount ?? null,
      interest: d.interest?.trim() || null,
      message: d.message?.trim() || null,
      source: d.source?.trim() || 'landing',
    },
  });
  // Notifica a equipe comercial (fire-and-forget; nunca bloqueia a captação).
  void sendLeadNotification({
    type: lead.type, name: lead.name, email: lead.email, phone: lead.phone,
    company: lead.company, cnpj: lead.cnpj, employeeCount: lead.employeeCount,
    interest: lead.interest, message: lead.message, source: lead.source,
  });
  void sendLeadWhatsApp({
    type: lead.type, name: lead.name, email: lead.email, phone: lead.phone,
    company: lead.company, employeeCount: lead.employeeCount, interest: lead.interest, source: lead.source,
  });
  return { lead };
}

apiRouter.post('/leads', async (req, res) => {
  const result = await createLeadFromInput(req.body);
  if ('error' in result) return res.status(400).json({ error: result.error });
  res.status(201).json({ ok: true, leadId: result.lead.id });
});
