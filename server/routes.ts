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
import { getSignerInfo, signPayload, isIcpConfigured } from './icp';

export const apiRouter = Router();

// --- Catálogo público ---

apiRouter.get('/courses', async (_req, res) => {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: { instructors: true },
    orderBy: { code: 'asc' },
  });
  res.json({ courses });
});

apiRouter.get('/courses/:id', async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { instructors: true },
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

  // Identidade do certificado digital ICP-Brasil. Quando o .pfx está
  // configurado (variáveis de ambiente), usamos a identidade REAL do
  // certificado e assinamos criptograficamente os dados. Caso contrário,
  // recorremos à identidade informada no painel administrativo.
  const cfg = await prisma.appConfig.findUnique({ where: { id: 'singleton' } });
  const payment = (cfg?.payment ?? {}) as Record<string, unknown>;
  const signer = getSignerInfo();

  const canonical = [
    enrollment.certificateCode,
    enrollment.user.name,
    enrollment.user.cpf,
    enrollment.course.code,
    enrollment.startDate,
  ].join('|');
  const sig = signPayload(canonical);

  const digitalSignature = {
    holder: signer?.holder || (payment.digitalCertificateHolder as string) || instructor?.name || 'Instrutor Qualificado',
    certificateName: (payment.digitalCertificateName as string) || null,
    issuer: signer?.issuer || (payment.digitalCertificateIssuer as string) || 'ICP-Brasil',
    serial: signer?.serial || (payment.digitalCertificateSerial as string) || null,
    validUntil: signer?.validUntil || (payment.digitalCertificateValidUntil as string) || null,
    icpVerified: isIcpConfigured(),
    algorithm: sig?.algorithm || null,
    signature: sig?.signature || null,
  };

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
      instructor: instructor?.name ?? 'Instrutor Qualificado',
      instructorFormation: instructor?.formation ?? 'Engenheiro de Segurança / Civil',
      instructorMte: instructor?.mte ?? null,
      instructorCrea: instructor?.crea ?? null,
      manualActivities: enrollment.course.manualActivities ?? [],
      digitalSignature,
    },
  });
});
