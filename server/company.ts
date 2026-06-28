/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel da Empresa: rotas com escopo restrito à empresa do gestor autenticado
 * (role COMPANY). O gestor só enxerga os funcionários da sua empresa e os
 * certificados emitidos por eles.
 */

import { Router, type Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { authenticate, type AuthedRequest } from './auth';
import { obligatoryTrainings, workloadForRisk } from './nr04';

export const companyRouter = Router();

companyRouter.use(authenticate);

// Garante que o usuário é gestor de empresa e devolve o companyId.
async function requireCompany(req: AuthedRequest, res: Response): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || user.role !== 'COMPANY' || !user.companyId) {
    res.status(403).json({ error: 'Acesso restrito ao gestor da empresa.' });
    return null;
  }
  return user.companyId;
}

// Painel: dados da empresa, funcionários e certificados emitidos da equipe.
companyRouter.get('/me', async (req: AuthedRequest, res: Response) => {
  const companyId = await requireCompany(req, res);
  if (!companyId) return;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  const members = await prisma.user.findMany({
    where: { companyId, role: 'STUDENT' },
    orderBy: { name: 'asc' },
    include: {
      enrollments: {
        include: { course: { select: { name: true, code: true, duration: true } } },
        orderBy: { startDate: 'desc' },
      },
    },
  });

  const employees = members.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    cpf: u.cpf,
    enrollments: u.enrollments.map((e) => ({
      courseName: e.course.name,
      courseCode: e.course.code,
      workload: e.course.duration,
      progress: e.progress,
      passed: e.passed,
      score: e.examScore,
      certificateCode: e.certificateCode,
      date: e.startDate,
    })),
  }));

  const totalCertificates = employees.reduce(
    (acc, e) => acc + e.enrollments.filter((en) => en.passed && en.certificateCode).length,
    0,
  );

  // Treinamentos obrigatórios pelo grau de risco (NR-04) e conformidade.
  const obligatoryCodes = obligatoryTrainings(company?.riskGrade);
  const courses = await prisma.course.findMany({
    where: { code: { in: obligatoryCodes } },
    select: { code: true, name: true, duration: true },
  });
  const codeToName = new Map(courses.map((c) => [c.code, c.name]));
  const codeToDuration = new Map(courses.map((c) => [c.code, c.duration]));

  // Conjunto de cursos concluídos (aprovado + certificado) por funcionário.
  const completedSets = employees.map(
    (e) => new Set(e.enrollments.filter((en) => en.passed && en.certificateCode).map((en) => en.courseCode)),
  );
  const compliantCount = completedSets.filter((s) => obligatoryCodes.every((c) => s.has(c))).length;

  const obligatory = obligatoryCodes.map((code) => ({
    code,
    name: codeToName.get(code) ?? code,
    completed: completedSets.filter((s) => s.has(code)).length,
    // Carga horária exigida conforme o grau de risco da empresa (NR-04).
    workload: workloadForRisk(code, company?.riskGrade, codeToDuration.get(code) ?? 0),
  }));

  const declaredTotal = company?.employeeCount ?? employees.length;

  res.json({
    company: company
      ? {
          id: company.id, name: company.name, cnpj: company.cnpj, email: company.email, phone: company.phone,
          employeeCount: company.employeeCount, cnae: company.cnae, cnaeDescription: company.cnaeDescription, riskGrade: company.riskGrade,
          accessSchedule: company.accessSchedule ?? {},
        }
      : null,
    employees,
    obligatory,
    stats: {
      declaredEmployees: declaredTotal,
      registeredEmployees: employees.length,
      certificates: totalCertificates,
      compliant: compliantCount,
      compliancePct: declaredTotal > 0 ? Math.round((compliantCount / declaredTotal) * 100) : 0,
    },
  });
});

// Define a restrição de horário de acesso aos treinamentos (dias e faixa).
companyRouter.patch('/access-schedule', async (req: AuthedRequest, res: Response) => {
  const companyId = await requireCompany(req, res);
  if (!companyId) return;
  const hhmm = z.string().regex(/^\d{1,2}:\d{2}$/);
  const parsed = z
    .object({
      enabled: z.boolean(),
      windows: z
        .array(
          z.object({
            days: z.array(z.number().int().min(0).max(6)).max(7).default([]),
            start: hhmm,
            end: hhmm,
          }),
        )
        .max(20)
        .optional(),
      // Compatibilidade com o formato antigo (faixa única):
      days: z.array(z.number().int().min(0).max(6)).max(7).optional(),
      start: hhmm.optional(),
      end: hhmm.optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Configuração de horário inválida.' });
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { accessSchedule: parsed.data as unknown as Prisma.InputJsonValue },
  });
  res.json({ accessSchedule: company.accessSchedule });
});
