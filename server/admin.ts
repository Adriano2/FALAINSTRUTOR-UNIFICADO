/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Rotas administrativas (somente ADMIN). Expõem leitura dos dados reais do
 * banco e as principais operações de escrita do painel.
 */

import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { authenticate, authorize, type AuthedRequest } from './auth';
import { lookupCnpj } from './nr04';
import { extractPfx } from './icp';
import { encryptSecret } from './crypto';
import { listExpirations, runExpiryAlerts } from './expiry';
import { sendEmail } from './email';

// E-mail do administrador master (recebe o relatório oculto de vendas por parceiro).
const MASTER_ADMIN_EMAIL = (process.env.MASTER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'adriano.ricardo01@gmail.com').toLowerCase();

export const adminRouter = Router();

// Todas as rotas exigem autenticação + papel de administrador.
adminRouter.use(authenticate, authorize('ADMIN'));

const sanitize = <T extends { passwordHash?: string }>(u: T) => {
  const { passwordHash, ...rest } = u;
  return rest;
};

// --- Gestão Pedagógica: monitoramento do progresso, tempos e certificados ---
adminRouter.get('/pedagogical', async (_req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: [{ enrolledAt: 'desc' }],
    include: {
      user: { select: { id: true, name: true, email: true, cpf: true } },
      course: { select: { code: true, name: true, duration: true } },
    },
  });

  const rows = enrollments.map((e) => ({
    id: e.id,
    studentName: e.user.name,
    studentEmail: e.user.email,
    studentCpf: e.user.cpf,
    courseCode: e.course.code,
    courseName: e.course.name,
    workload: e.course.duration,
    progress: e.progress,
    watchedSeconds: e.watchedSeconds,
    firstAccessAt: e.firstAccessAt,
    examStartedAt: e.examStartedAt,
    examFinishedAt: e.examFinishedAt,
    examScore: e.examScore,
    passed: e.passed,
    released: e.released,
    releasedAt: e.releasedAt, // hora de liberação da prova pelo instrutor = emissão do certificado
    certificateCode: e.certificateCode,
    enrolledAt: e.enrolledAt,
    // Revogação (2 etapas)
    revocationRequested: e.revocationRequested,
    revocationReason: e.revocationReason,
    revocationRequestedBy: e.revocationRequestedBy,
    revoked: e.revoked,
    revokedAt: e.revokedAt,
  }));

  // Logs de acesso (hora de login por usuário) — últimos 200.
  const sessions = await prisma.loginSession.findMany({
    orderBy: { loginAt: 'desc' },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });
  const logins = sessions.map((s) => ({
    userName: s.user.name,
    userEmail: s.user.email,
    loginAt: s.loginAt,
    userAgent: s.userAgent,
  }));

  // Janelas de acesso configuradas por empresa (restrição de horário).
  const companies = await prisma.company.findMany({
    where: { isActive: true },
    select: { name: true, accessSchedule: true },
    orderBy: { name: 'asc' },
  });
  const accessWindows = companies
    .map((c) => ({ name: c.name, schedule: c.accessSchedule as Record<string, unknown> }))
    .filter((c) => c.schedule && (c.schedule as { enabled?: boolean }).enabled);

  res.json({ rows, logins, accessWindows });
});

// Etapa 2 (final) da revogação: APENAS o administrador revoga definitivamente.
// O certificado deixa de ser válido na validação pública.
adminRouter.post('/enrollments/:id/revoke', async (req: AuthedRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  const enr = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
  if (!enr) return res.status(404).json({ error: 'Matrícula/certificado não encontrado.' });
  await prisma.enrollment.update({
    where: { id: enr.id },
    data: { revoked: true, revokedAt: new Date(), revokedBy: admin?.name ?? 'Administrador', released: false },
  });
  res.json({ ok: true });
});

// Rejeita (descarta) uma solicitação de revogação pendente.
adminRouter.post('/enrollments/:id/revocation/reject', async (req: AuthedRequest, res) => {
  const enr = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
  if (!enr) return res.status(404).json({ error: 'Matrícula não encontrada.' });
  await prisma.enrollment.update({
    where: { id: enr.id },
    data: { revocationRequested: false, revocationReason: null, revocationRequestedBy: null, revocationRequestedAt: null },
  });
  res.json({ ok: true });
});

// --- Usuários ---
adminRouter.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { registeredAt: 'desc' } });
  res.json({ users: users.map(sanitize) });
});

adminRouter.post('/users', async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      cpf: z.string().min(11),
      dob: z.string().optional(),
      role: z.enum(['ADMIN', 'STUDENT']).default('STUDENT'),
      password: z.string().min(6).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.' });

  const { name, email, cpf, dob, role, password } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();
  const exists = await prisma.user.findFirst({ where: { OR: [{ email: cleanEmail }, { cpf }] }, select: { id: true } });
  if (exists) return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });

  const passwordHash = await bcrypt.hash(password ?? 'falainstrutor123', 10);
  const user = await prisma.user.create({ data: { name, email: cleanEmail, cpf, dob, role, passwordHash } });
  res.status(201).json({ user: sanitize(user) });
});

adminRouter.patch('/users/:id/active', async (req, res) => {
  const parsed = z.object({ isActive: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.' });
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: parsed.data.isActive } });
  res.json({ user: sanitize(user) });
});

// Redefine e-mail e/ou senha de um usuário (admin).
adminRouter.patch('/users/:id/credentials', async (req, res) => {
  const parsed = z
    .object({ email: z.string().email().optional(), password: z.string().min(6).optional() })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos (senha mínima de 6 caracteres).' });
  const data: Prisma.UserUpdateInput = {};
  if (parsed.data.email) {
    const email = parsed.data.email.toLowerCase().trim();
    const exists = await prisma.user.findFirst({ where: { email, NOT: { id: req.params.id } }, select: { id: true } });
    if (exists) return res.status(409).json({ error: 'E-mail já em uso por outro usuário.' });
    data.email = email;
  }
  if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Nada para atualizar.' });
  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ user: sanitize(user) });
});

// --- Matrículas / vendas / exames ---
adminRouter.get('/enrollments', async (_req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    include: { user: true, course: true },
    orderBy: { enrolledAt: 'desc' },
  });
  res.json({ enrollments });
});

adminRouter.post('/enrollments/batch', async (req, res) => {
  const parsed = z.object({ userIds: z.array(z.string()).min(1), courseId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Selecione usuários e um curso.' });
  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });

  let created = 0;
  for (const userId of parsed.data.userIds) {
    const already = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } });
    if (already) continue;
    await prisma.enrollment.create({ data: { userId, courseId: course.id } });
    created++;
  }
  res.json({ created });
});

adminRouter.get('/transactions', async (_req, res) => {
  const transactions = await prisma.transaction.findMany({ include: { user: true }, orderBy: { date: 'desc' } });
  res.json({ transactions });
});

adminRouter.get('/exams', async (_req, res) => {
  const exams = await prisma.examSubmission.findMany({ include: { user: true, course: true }, orderBy: { date: 'desc' } });
  res.json({ exams });
});

// --- Comentários ---
adminRouter.get('/comments', async (_req, res) => {
  const comments = await prisma.comment.findMany({ include: { user: true, course: true }, orderBy: { date: 'desc' } });
  res.json({ comments });
});

adminRouter.patch('/comments/:id/reply', async (req, res) => {
  const parsed = z.object({ reply: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Resposta vazia.' });
  const comment = await prisma.comment.update({ where: { id: req.params.id }, data: { reply: parsed.data.reply } });
  res.json({ comment });
});

// --- Contatos ---
adminRouter.get('/contacts', async (_req, res) => {
  const contacts = await prisma.contactMessage.findMany({ orderBy: { date: 'desc' } });
  res.json({ contacts });
});

// --- Cupons ---
adminRouter.get('/coupons', async (_req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: 'asc' } });
  res.json({ coupons });
});

adminRouter.post('/coupons', async (req, res) => {
  const parsed = z
    .object({
      code: z.string().min(2),
      description: z.string().default(''),
      value: z.number(),
      type: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
      associatedProducts: z.array(z.string()).default([]),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do cupom inválidos.' });
  const coupon = await prisma.coupon.create({
    data: { ...parsed.data, code: parsed.data.code.toUpperCase() } as Prisma.CouponCreateInput,
  });
  res.status(201).json({ coupon });
});

adminRouter.patch('/coupons/:id/active', async (req, res) => {
  const parsed = z.object({ isActive: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.' });
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: { isActive: parsed.data.isActive } });
  res.json({ coupon });
});

// --- Gestão de empresas ---

adminRouter.get('/companies', async (_req, res) => {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true } } },
  });
  res.json({ companies });
});

// Consulta de CNPJ (BrasilAPI) → razão social, CNAE principal e grau de risco (NR-04).
adminRouter.get('/cnpj/:cnpj', async (req, res) => {
  try {
    const info = await lookupCnpj(req.params.cnpj);
    res.json({ info });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Falha na consulta do CNPJ.' });
  }
});

adminRouter.post('/companies', async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      cnpj: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      employeeCount: z.number().int().min(1),
      cnae: z.string().optional(),
      cnaeDescription: z.string().optional(),
      riskGrade: z.number().int().min(1).max(4).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados da empresa inválidos. Informe o total de funcionários (mínimo 1).' });
  const company = await prisma.company.create({ data: parsed.data as Prisma.CompanyCreateInput });
  res.status(201).json({ company });
});

adminRouter.patch('/companies/:id', async (req, res) => {
  const parsed = z
    .object({
      name: z.string().optional(),
      cnpj: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      employeeCount: z.number().int().min(1).optional(),
      cnae: z.string().optional(),
      cnaeDescription: z.string().optional(),
      riskGrade: z.number().int().min(1).max(4).optional(),
      isActive: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Atualização inválida.' });
  const company = await prisma.company.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ company });
});

// Cria o usuário gestor (role COMPANY) que acessa o painel da empresa.
adminRouter.post('/companies/:id/manager', async (req, res) => {
  const parsed = z
    .object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), cpf: z.string().min(3) })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do gestor inválidos (senha mínima de 6 caracteres).' });
  const exists = await prisma.user.findFirst({ where: { OR: [{ email: parsed.data.email.toLowerCase() }, { cpf: parsed.data.cpf }] }, select: { id: true } });
  if (exists) return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const manager = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), cpf: parsed.data.cpf, passwordHash, role: 'COMPANY', companyId: req.params.id },
  });
  res.status(201).json({ manager: { id: manager.id, name: manager.name, email: manager.email } });
});

// Vincula/desvincula um funcionário (aluno) a uma empresa.
adminRouter.patch('/users/:id/company', async (req, res) => {
  const parsed = z.object({ companyId: z.string().nullable() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Vínculo inválido.' });
  await prisma.user.update({ where: { id: req.params.id }, data: { companyId: parsed.data.companyId } });
  res.json({ ok: true });
});

// --- Gestão de instrutores ---

const instructorSchema = z.object({
  name: z.string().min(2),
  formation: z.string().min(2),
  mte: z.string().optional(),
  cpf: z.string().optional(),
  codCBO: z.string().optional(),
  crea: z.string().optional(),
  crq: z.string().optional(),
  signatureUrl: z.string().optional(),
  icpEnabled: z.boolean().default(false),
});

// Seleção segura do instrutor (NUNCA inclui o .pfx nem a senha cifrados).
const instructorSelect = {
  id: true, name: true, formation: true, mte: true, cpf: true, codCBO: true, crea: true, crq: true,
  signatureUrl: true, icpEnabled: true,
  digitalCertHolder: true, digitalCertIssuer: true, digitalCertSerial: true, digitalCertValidUntil: true,
  digitalCertPfx: true, // usado só para derivar o flag; removido no mapeamento
  course: { select: { id: true, code: true, name: true } },
} as const;

type InstructorRow = Prisma.InstructorGetPayload<{ select: typeof instructorSelect }>;

// Mapeia para o formato público: troca o .pfx cifrado por um booleano.
function mapInstructor(i: InstructorRow) {
  const { digitalCertPfx, ...rest } = i;
  return { ...rest, hasDigitalCert: Boolean(digitalCertPfx) };
}

async function listInstructorsSafe() {
  const rows = await prisma.instructor.findMany({ select: instructorSelect, orderBy: { name: 'asc' } });
  return rows.map(mapInstructor);
}

// Lista todos os instrutores cadastrados, com o curso ao qual estão associados.
adminRouter.get('/instructors', async (_req, res) => {
  res.json({ instructors: await listInstructorsSafe() });
});

// Configura o CERTIFICADO DIGITAL de um instrutor (por nome — vale para todas as
// associações dele). Aceita identidade manual (assinatura eletrônica) e/ou o
// upload do .pfx A1 (assinatura ICP-Brasil). O .pfx e a senha são VALIDADOS,
// cifrados em repouso e nunca retornados pela API.
adminRouter.patch('/instructors/certificate', async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      icpEnabled: z.boolean().optional(),
      holder: z.string().optional(),
      issuer: z.string().optional(),
      serial: z.string().optional(),
      validUntil: z.string().optional(),
      pfxBase64: z.string().optional(), // conteúdo do .pfx em base64 (opcional)
      password: z.string().optional(),  // senha do .pfx (opcional)
      clearPfx: z.boolean().optional(), // remove o .pfx (volta a eletrônica)
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do certificado inválidos.' });
  const d = parsed.data;

  const data: Prisma.InstructorUpdateManyMutationInput = {};
  if (d.icpEnabled !== undefined) data.icpEnabled = d.icpEnabled;
  if (d.holder !== undefined) data.digitalCertHolder = d.holder || null;
  if (d.issuer !== undefined) data.digitalCertIssuer = d.issuer || null;
  if (d.serial !== undefined) data.digitalCertSerial = d.serial || null;
  if (d.validUntil !== undefined) data.digitalCertValidUntil = d.validUntil || null;

  if (d.clearPfx) {
    data.digitalCertPfx = null;
    data.digitalCertPassword = null;
  } else if (d.pfxBase64 && d.password) {
    // Valida o .pfx + senha extraindo a identidade real do certificado.
    let buffer: Buffer;
    try { buffer = Buffer.from(d.pfxBase64, 'base64'); } catch { return res.status(400).json({ error: 'Arquivo .pfx inválido.' }); }
    const extracted = extractPfx(buffer, d.password);
    if (!extracted) return res.status(400).json({ error: 'Não foi possível abrir o .pfx. Verifique o arquivo e a senha.' });
    // Cifra em repouso (AES-256-GCM).
    data.digitalCertPfx = encryptSecret(d.pfxBase64);
    data.digitalCertPassword = encryptSecret(d.password);
    // Preenche a identidade a partir do próprio certificado (autoritativo).
    data.digitalCertHolder = extracted.info.holder;
    data.digitalCertIssuer = extracted.info.issuer;
    data.digitalCertSerial = extracted.info.serial;
    data.digitalCertValidUntil = extracted.info.validUntil;
    data.icpEnabled = true;
  } else if ((d.pfxBase64 && !d.password) || (!d.pfxBase64 && d.password)) {
    return res.status(400).json({ error: 'Para a assinatura ICP-Brasil envie o arquivo .pfx e a senha juntos.' });
  }

  const result = await prisma.instructor.updateMany({ where: { name: d.name }, data });
  if (result.count === 0) return res.status(404).json({ error: 'Instrutor não encontrado.' });
  res.json({ instructors: await listInstructorsSafe() });
});

// Cadastra um instrutor e o associa a um ou mais treinamentos de uma só vez.
adminRouter.post('/instructors', async (req, res) => {
  const parsed = instructorSchema
    .extend({ courseIds: z.array(z.string()).min(1) })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do instrutor inválidos. Selecione ao menos um treinamento.' });
  const { courseIds, ...data } = parsed.data;
  await prisma.instructor.createMany({
    data: courseIds.map((courseId) => ({ ...data, courseId })) as Prisma.InstructorUncheckedCreateInput[],
  });
  res.status(201).json({ instructors: await listInstructorsSafe() });
});

// Cria o acesso (login) do instrutor (role INSTRUCTOR). O nome deve coincidir
// com o cadastrado em Instructor para o vínculo dos cursos no painel.
adminRouter.post('/instructors/login', async (req, res) => {
  const parsed = z
    .object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), cpf: z.string().min(3) })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do instrutor inválidos (senha mínima de 6 caracteres).' });
  const exists = await prisma.user.findFirst({ where: { OR: [{ email: parsed.data.email.toLowerCase() }, { cpf: parsed.data.cpf }] }, select: { id: true } });
  if (exists) return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const u = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), cpf: parsed.data.cpf, passwordHash, role: 'INSTRUCTOR' },
  });
  res.status(201).json({ instructor: { id: u.id, name: u.name, email: u.email } });
});

// Atualiza dados cadastrais do instrutor (inclui CPF/registro para o eSocial).
adminRouter.patch('/instructors/:id', async (req, res) => {
  const parsed = instructorSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do instrutor inválidos.' });
  await prisma.instructor.update({
    where: { id: req.params.id },
    data: parsed.data as Prisma.InstructorUpdateInput,
  }).catch(() => {});
  res.json({ instructors: await listInstructorsSafe() });
});

// Remove a associação de um instrutor a um treinamento.
adminRouter.delete('/instructors/:id', async (req, res) => {
  await prisma.instructor.delete({ where: { id: req.params.id } }).catch(() => {});
  res.json({ ok: true });
});

adminRouter.post('/courses/:id/instructors', async (req, res) => {
  const parsed = instructorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do instrutor inválidos.' });
  await prisma.instructor.create({
    data: { ...parsed.data, courseId: req.params.id } as Prisma.InstructorUncheckedCreateInput,
  });
  const course = await prisma.course.findUnique({ where: { id: req.params.id }, include: { instructors: true } });
  res.status(201).json({ course });
});

// Atualiza o conteúdo de mídia do curso: vídeo aula e materiais de apoio.
adminRouter.patch('/courses/:id/content', async (req, res) => {
  const parsed = z
    .object({
      videoUrl: z.string().optional(),
      moduleVideos: z.array(z.string()).optional(),
      documents: z.array(z.object({ name: z.string().min(1), url: z.string().min(1) })).optional(),
      modality: z.enum(['EaD', 'Semipresencial', 'Presencial']).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Conteúdo do curso inválido.' });
  const data: Prisma.CourseUpdateInput = {};
  if (parsed.data.videoUrl !== undefined) data.videoUrl = parsed.data.videoUrl || null;
  if (parsed.data.moduleVideos !== undefined) data.moduleVideos = parsed.data.moduleVideos as unknown as Prisma.InputJsonValue;
  if (parsed.data.documents !== undefined) data.documents = parsed.data.documents as unknown as Prisma.InputJsonValue;
  if (parsed.data.modality !== undefined) data.modality = parsed.data.modality;
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data,
    include: { instructors: true },
  });
  res.json({ course });
});

// --- Parceiros white-label ---
adminRouter.get('/partners', async (_req, res) => {
  const partners = await prisma.partner.findMany({ orderBy: { createdAt: 'asc' } });
  res.json({ partners });
});

const partnerSchema = z.object({
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen.'),
  name: z.string().min(2),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  whatsappNumber: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

adminRouter.post('/partners', async (req, res) => {
  const parsed = partnerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  const slug = parsed.data.slug.toLowerCase();
  const exists = await prisma.partner.findUnique({ where: { slug }, select: { id: true } });
  if (exists) return res.status(409).json({ error: 'Já existe um parceiro com esse subdomínio.' });
  const partner = await prisma.partner.create({ data: { ...parsed.data, slug } as Prisma.PartnerUncheckedCreateInput });
  res.status(201).json({ partner });
});

adminRouter.patch('/partners/:id', async (req, res) => {
  const parsed = partnerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  const data = { ...parsed.data };
  if (data.slug) data.slug = data.slug.toLowerCase();
  const partner = await prisma.partner.update({ where: { id: req.params.id }, data: data as Prisma.PartnerUpdateInput });
  res.json({ partner });
});

adminRouter.delete('/partners/:id', async (req, res) => {
  await prisma.partner.delete({ where: { id: req.params.id } }).catch(() => {});
  res.json({ ok: true });
});

// --- Trilhas por cargo/função ---
adminRouter.get('/job-roles', async (_req, res) => {
  const roles = await prisma.jobRole.findMany({ orderBy: { name: 'asc' } });
  res.json({ jobRoles: roles });
});
const jobRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().max(300).optional(),
  courseCodes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});
adminRouter.post('/job-roles', async (req, res) => {
  const parsed = jobRoleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do cargo inválidos.' });
  const d = parsed.data;
  const role = await prisma.jobRole.create({
    data: { name: d.name, description: d.description ?? '', isActive: d.isActive ?? true, courseCodes: (d.courseCodes ?? []) as unknown as Prisma.InputJsonValue },
  });
  res.status(201).json({ jobRole: role });
});
adminRouter.patch('/job-roles/:id', async (req, res) => {
  const parsed = jobRoleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do cargo inválidos.' });
  const d = parsed.data;
  const data: Prisma.JobRoleUpdateInput = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.description !== undefined) data.description = d.description;
  if (d.isActive !== undefined) data.isActive = d.isActive;
  if (d.courseCodes !== undefined) data.courseCodes = d.courseCodes as unknown as Prisma.InputJsonValue;
  const role = await prisma.jobRole.update({ where: { id: req.params.id }, data });
  res.json({ jobRole: role });
});
adminRouter.delete('/job-roles/:id', async (req, res) => {
  await prisma.jobRole.delete({ where: { id: req.params.id } }).catch(() => {});
  res.json({ ok: true });
});

// --- Relatório OCULTO de vendas por parceiro (somente administrador master) ---
// Só o administrador master (MASTER_ADMIN_EMAIL) enxerga a leitura do que foi
// vendido atribuído a cada parceiro white-label; demais administradores não.
async function requireMaster(req: AuthedRequest, res: Response): Promise<boolean> {
  const me = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: { email: true } });
  if (!me || me.email.toLowerCase() !== MASTER_ADMIN_EMAIL) {
    res.status(403).json({ error: 'Acesso restrito ao administrador master.' });
    return false;
  }
  return true;
}

// Agrega as vendas pagas por parceiro de origem.
async function buildPartnerSales() {
  const orders = await prisma.order.findMany({
    where: { status: 'PAID' },
    select: { total: true, discount: true, partnerSlug: true, createdAt: true },
  });
  const partners = await prisma.partner.findMany({ select: { slug: true, name: true } });
  const nameBySlug = new Map(partners.map((p) => [p.slug, p.name]));

  // Order.total já é LÍQUIDO (subtotal − desconto). Bruto = total + desconto.
  const agg = new Map<string, { slug: string; name: string; orders: number; gross: number; discount: number; net: number }>();
  for (const o of orders) {
    const slug = o.partnerSlug ?? '';
    const key = slug || '__direct__';
    const name = slug ? (nameBySlug.get(slug) ?? slug) : 'Venda direta (FalaInstrutor)';
    const cur = agg.get(key) ?? { slug, name, orders: 0, gross: 0, discount: 0, net: 0 };
    cur.orders += 1;
    cur.gross += o.total + o.discount;
    cur.discount += o.discount;
    cur.net += o.total;
    agg.set(key, cur);
  }
  const rows = [...agg.values()].sort((a, b) => b.net - a.net);
  const totals = rows.reduce(
    (acc, r) => ({ orders: acc.orders + r.orders, gross: acc.gross + r.gross, discount: acc.discount + r.discount, net: acc.net + r.net }),
    { orders: 0, gross: 0, discount: 0, net: 0 },
  );
  return { rows, totals };
}

adminRouter.get('/partner-sales', async (req: AuthedRequest, res: Response) => {
  if (!(await requireMaster(req, res))) return;
  res.json(await buildPartnerSales());
});

// Envia o relatório de vendas por parceiro de forma OCULTA: apenas para o
// e-mail do administrador master, sem expor a outros administradores.
adminRouter.post('/partner-sales/send', async (req: AuthedRequest, res: Response) => {
  if (!(await requireMaster(req, res))) return;
  const { rows, totals } = await buildPartnerSales();
  const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const trs = rows
    .map((r) => `<tr><td style="padding:6px 10px">${r.name}</td><td style="padding:6px 10px;text-align:center">${r.orders}</td><td style="padding:6px 10px;text-align:right">${brl(r.gross)}</td><td style="padding:6px 10px;text-align:right">${brl(r.discount)}</td><td style="padding:6px 10px;text-align:right">${brl(r.net)}</td></tr>`)
    .join('');
  const html = `
    <h2 style="font-family:Arial">Relatório confidencial — Vendas por parceiro</h2>
    <p style="font-family:Arial;color:#475569">Documento interno do administrador master. Não compartilhar.</p>
    <table style="border-collapse:collapse;font-family:Arial;font-size:13px;border:1px solid #e2e8f0">
      <thead><tr style="background:#1f2a44;color:#fff"><th style="padding:6px 10px;text-align:left">Parceiro</th><th style="padding:6px 10px">Pedidos</th><th style="padding:6px 10px">Bruto</th><th style="padding:6px 10px">Descontos</th><th style="padding:6px 10px">Líquido</th></tr></thead>
      <tbody>${trs || '<tr><td colspan="5" style="padding:10px">Sem vendas pagas.</td></tr>'}</tbody>
      <tfoot><tr style="font-weight:bold;border-top:2px solid #1f2a44"><td style="padding:6px 10px">TOTAL</td><td style="padding:6px 10px;text-align:center">${totals.orders}</td><td style="padding:6px 10px;text-align:right">${brl(totals.gross)}</td><td style="padding:6px 10px;text-align:right">${brl(totals.discount)}</td><td style="padding:6px 10px;text-align:right">${brl(totals.net)}</td></tr></tfoot>
    </table>`;
  const ok = await sendEmail(MASTER_ADMIN_EMAIL, 'FalaInstrutor — Relatório confidencial de vendas por parceiro', html);
  res.json({ ok, sentTo: ok ? MASTER_ADMIN_EMAIL : null });
});

// --- Planos de assinatura corporativa ---
adminRouter.get('/plans', async (_req, res) => {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ plans });
});

const planSchema = z.object({
  name: z.string().min(2),
  description: z.string().max(400).optional(),
  priceMonthly: z.number().min(0),
  maxEmployees: z.number().int().min(1).nullable().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  highlight: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

adminRouter.post('/plans', async (req, res) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do plano inválidos.' });
  const d = parsed.data;
  const plan = await prisma.plan.create({
    data: {
      name: d.name, description: d.description ?? '', priceMonthly: d.priceMonthly,
      maxEmployees: d.maxEmployees ?? null, features: (d.features ?? []) as unknown as Prisma.InputJsonValue,
      isActive: d.isActive ?? true, highlight: d.highlight ?? false, sortOrder: d.sortOrder ?? 0,
    },
  });
  res.status(201).json({ plan });
});

adminRouter.patch('/plans/:id', async (req, res) => {
  const parsed = planSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do plano inválidos.' });
  const d = parsed.data;
  const data: Prisma.PlanUpdateInput = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.description !== undefined) data.description = d.description;
  if (d.priceMonthly !== undefined) data.priceMonthly = d.priceMonthly;
  if (d.maxEmployees !== undefined) data.maxEmployees = d.maxEmployees;
  if (d.features !== undefined) data.features = d.features as unknown as Prisma.InputJsonValue;
  if (d.isActive !== undefined) data.isActive = d.isActive;
  if (d.highlight !== undefined) data.highlight = d.highlight;
  if (d.sortOrder !== undefined) data.sortOrder = d.sortOrder;
  const plan = await prisma.plan.update({ where: { id: req.params.id }, data });
  res.json({ plan });
});

adminRouter.delete('/plans/:id', async (req, res) => {
  await prisma.plan.delete({ where: { id: req.params.id } }).catch(() => {});
  res.json({ ok: true });
});

// Atribui (ou remove) um plano a uma empresa.
adminRouter.patch('/companies/:id/plan', async (req, res) => {
  const parsed = z.object({ planId: z.string().nullable(), subscriptionStatus: z.string().nullable().optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.' });
  const company = await prisma.company.update({
    where: { id: req.params.id },
    data: { planId: parsed.data.planId, subscriptionStatus: parsed.data.subscriptionStatus ?? (parsed.data.planId ? 'active' : null) },
  });
  res.json({ company });
});

// Vencimentos de certificados (todos, com validade calculada).
adminRouter.get('/expirations', async (_req, res) => {
  const rows = await listExpirations();
  res.json({ expirations: rows });
});

// Dispara os alertas de renovação (e-mail ao aluno + resumo por WhatsApp).
adminRouter.post('/expirations/notify', async (req, res) => {
  const days = Number(req.body?.daysAhead) || 30;
  const result = await runExpiryAlerts(days);
  res.json(result);
});

// Atualização de preço/visibilidade do curso (Gestão de Cursos).
adminRouter.patch('/courses/:id/price', async (req, res) => {
  const parsed = z
    .object({
      price: z.number().min(0).max(1_000_000).optional(),
      validityMonths: z.number().int().min(1).max(120).optional(),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      esocialEnabled: z.boolean().optional(),
      esocialCode: z.string().max(20).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Valores inválidos.' });
  const data: Prisma.CourseUpdateInput = {};
  if (parsed.data.price !== undefined) data.price = parsed.data.price;
  if (parsed.data.validityMonths !== undefined) data.validityMonths = parsed.data.validityMonths;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
  if (parsed.data.isFeatured !== undefined) data.isFeatured = parsed.data.isFeatured;
  if (parsed.data.esocialEnabled !== undefined) data.esocialEnabled = parsed.data.esocialEnabled;
  if (parsed.data.esocialCode !== undefined) data.esocialCode = parsed.data.esocialCode.trim() || null;
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Nada para atualizar.' });
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data,
    include: { instructors: true },
  });
  res.json({ course });
});

// Editor de provas: salva o banco de questões do curso.
adminRouter.patch('/courses/:id/exam', async (req, res) => {
  const parsed = z
    .object({
      questions: z.array(
        z.object({
          question: z.string().min(1),
          options: z.array(z.string().min(1)).min(2),
          correctIndex: z.number().int().min(0),
        }),
      ),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Prova inválida. Verifique questões, alternativas e a resposta correta.' });
  // Garante que o índice correto está dentro das alternativas.
  for (const q of parsed.data.questions) {
    if (q.correctIndex >= q.options.length) {
      return res.status(400).json({ error: 'Há uma questão com resposta correta fora das alternativas.' });
    }
  }
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data: { examQuestions: parsed.data.questions as unknown as Prisma.InputJsonValue },
    include: { instructors: true },
  });
  res.json({ course });
});

// Salva o deck de slides do treinamento (Gerenciador de Slides do admin).
adminRouter.patch('/courses/:id/slides', async (req, res) => {
  const parsed = z
    .object({
      slides: z.array(
        z.object({
          title: z.string().min(1),
          bullets: z.array(z.string().min(1)),
          images: z.array(z.string().min(1)).optional(),
        }),
      ),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Slides inválidos. Cada slide precisa de título e ao menos um tópico.' });
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data: { slides: parsed.data.slides as unknown as Prisma.InputJsonValue },
    include: { instructors: true },
  });
  res.json({ course });
});

adminRouter.post('/courses/:id/modules', async (req, res) => {
  const parsed = z.object({ module: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Módulo inválido.' });
  const existing = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Curso não encontrado.' });
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data: { modules: { set: [...existing.modules, parsed.data.module] } },
    include: { instructors: true },
  });
  res.json({ course });
});

// --- Notas Fiscais de Serviço (NFS-e) — base de gerenciamento ---
// TODO(NFS-e): integrar emissão automática (NFE.io / PlugNotas / Focus NFe)
// para tomadores CPF e CNPJ. Ver TODO.md. Hoje o fluxo é manual.

const invoiceSchema = z.object({
  recipientType: z.enum(['PF', 'PJ']).default('PF'),
  document: z.string().min(3),
  recipientName: z.string().min(2),
  email: z.string().optional(),
  serviceDesc: z.string().min(2),
  amount: z.number().nonnegative(),
  issueDate: z.string().optional(),
  number: z.string().optional(),
  series: z.string().optional(),
  orderId: z.string().optional(),
  notes: z.string().optional(),
});

adminRouter.get('/invoices', async (_req, res) => {
  const invoices = await prisma.serviceInvoice.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ invoices });
});

adminRouter.post('/invoices', async (req, res) => {
  const parsed = invoiceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados da nota fiscal inválidos.' });
  const { issueDate, ...rest } = parsed.data;
  const invoice = await prisma.serviceInvoice.create({
    data: {
      ...rest,
      ...(issueDate ? { issueDate: new Date(issueDate) } : {}),
    } as Prisma.ServiceInvoiceUncheckedCreateInput,
  });
  res.status(201).json({ invoice });
});

adminRouter.patch('/invoices/:id', async (req, res) => {
  const parsed = z
    .object({
      status: z.enum(['PENDING', 'ISSUED', 'CANCELED']).optional(),
      number: z.string().optional(),
      series: z.string().optional(),
      notes: z.string().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Atualização inválida.' });
  const invoice = await prisma.serviceInvoice.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ invoice });
});

adminRouter.delete('/invoices/:id', async (req, res) => {
  await prisma.serviceInvoice.delete({ where: { id: req.params.id } }).catch(() => {});
  res.json({ ok: true });
});

// --- Conteúdo editável do site (notícias, parceiros, páginas, etc.) ---
adminRouter.get('/content/:key', async (req, res) => {
  const row = await prisma.siteContent.findUnique({ where: { key: req.params.key } });
  res.json({ key: req.params.key, data: row?.data ?? [] });
});

adminRouter.put('/content/:key', async (req, res) => {
  const data = (req.body?.data ?? []) as Prisma.InputJsonValue;
  const row = await prisma.siteContent.upsert({
    where: { key: req.params.key },
    update: { data },
    create: { key: req.params.key, data },
  });
  res.json({ key: row.key, data: row.data });
});

// --- Configurações globais (layout + pagamento) ---
adminRouter.get('/config', async (_req, res) => {
  const cfg = await prisma.appConfig.findUnique({ where: { id: 'singleton' } });
  res.json({ layout: cfg?.layout ?? null, payment: cfg?.payment ?? null });
});

adminRouter.put('/config', async (req, res) => {
  const layout = (req.body?.layout ?? {}) as Prisma.InputJsonValue;
  const payment = (req.body?.payment ?? {}) as Prisma.InputJsonValue;
  const cfg = await prisma.appConfig.upsert({
    where: { id: 'singleton' },
    update: { layout, payment },
    create: { id: 'singleton', layout, payment },
  });
  res.json({ layout: cfg.layout, payment: cfg.payment });
});

// --- Captação de leads (landing de divulgação + agente de IA) ---

adminRouter.get('/leads', async (_req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  res.json({ leads });
});

adminRouter.patch('/leads/:id', async (req, res) => {
  const parsed = z
    .object({ status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DISCARDED']) })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Status inválido.' });
  const lead = await prisma.lead.update({ where: { id: req.params.id }, data: { status: parsed.data.status } }).catch(() => null);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
  res.json({ lead });
});

adminRouter.delete('/leads/:id', async (req, res) => {
  await prisma.lead.delete({ where: { id: req.params.id } }).catch(() => {});
  res.json({ ok: true });
});
