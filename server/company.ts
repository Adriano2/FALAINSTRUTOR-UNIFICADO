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
import { prisma } from './db';
import { authenticate, type AuthedRequest } from './auth';

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

  res.json({
    company: company ? { id: company.id, name: company.name, cnpj: company.cnpj, email: company.email, phone: company.phone } : null,
    employees,
    stats: { employees: employees.length, certificates: totalCertificates },
  });
});
