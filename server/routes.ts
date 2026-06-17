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

apiRouter.get('/enrollments/me', authenticate, async (req: AuthedRequest, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user!.sub },
    include: { course: { include: { instructors: true } } },
    orderBy: { enrolledAt: 'desc' },
  });
  res.json({ enrollments });
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
