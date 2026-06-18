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

// Submete o exame final: grava nota, aprovação, certificado e o registro.
apiRouter.post('/enrollments/:id/exam', authenticate, async (req: AuthedRequest, res: Response) => {
  const parsed = z
    .object({
      score: z.number().int().min(0).max(100),
      passed: z.boolean(),
      answers: z.record(z.string(), z.number()).optional(),
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

  const { score, passed, answers } = parsed.data;

  // Gera o código do certificado no servidor (autoritativo).
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
    },
    include: enrollInclude,
  });

  await prisma.examSubmission.create({
    data: {
      userId: enr.userId,
      courseId: enr.courseId,
      score,
      passed,
      answers: (answers ?? {}) as Prisma.InputJsonValue,
    },
  });

  res.json({ enrollment });
});

// --- Validação pública de certificado ---

apiRouter.get('/certificates/:code', async (req, res) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: { certificateCode: req.params.code.trim().toUpperCase(), passed: true },
    include: { user: true, course: { include: { instructors: true } } },
  });
  if (!enrollment) {
    return res.status(404).json({ valid: false, error: 'Certificado não encontrado.' });
  }
  const instructor = enrollment.course.instructors[0];
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
      manualActivities: enrollment.course.manualActivities ?? [],
    },
  });
});
