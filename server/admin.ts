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

export const adminRouter = Router();

// Todas as rotas exigem autenticação + papel de administrador.
adminRouter.use(authenticate, authorize('ADMIN'));

const sanitize = <T extends { passwordHash?: string }>(u: T) => {
  const { passwordHash, ...rest } = u;
  return rest;
};

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

// --- Gestão de instrutores ---

const instructorSchema = z.object({
  name: z.string().min(2),
  formation: z.string().min(2),
  mte: z.string().optional(),
  crea: z.string().optional(),
  signatureUrl: z.string().optional(),
  icpEnabled: z.boolean().default(false),
});

// Lista todos os instrutores cadastrados, com o curso ao qual estão associados.
adminRouter.get('/instructors', async (_req, res) => {
  const instructors = await prisma.instructor.findMany({
    include: { course: { select: { id: true, code: true, name: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({ instructors });
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
  const instructors = await prisma.instructor.findMany({
    include: { course: { select: { id: true, code: true, name: true } } },
    orderBy: { name: 'asc' },
  });
  res.status(201).json({ instructors });
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
