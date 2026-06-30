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
import { buildS2245Records, generateS2245Xml, recordsToCsv } from './esocial';

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
      jobRole: true,
      enrollments: {
        include: { course: { select: { name: true, code: true, duration: true, validityMonths: true } } },
        orderBy: { startDate: 'desc' },
      },
    },
  });

  // Trilhas (cargos/funções) ativas, para montar o plano de treinamento
  // obrigatório de cada funcionário conforme a função que ocupa.
  const jobRoles = await prisma.jobRole.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  const trilhaCodes = new Set<string>();
  for (const r of jobRoles) for (const c of (r.courseCodes as unknown as string[]) ?? []) trilhaCodes.add(c);
  const trilhaCourses = await prisma.course.findMany({
    where: { code: { in: [...trilhaCodes] } },
    select: { code: true, name: true },
  });
  const trilhaCodeToName = new Map(trilhaCourses.map((c) => [c.code, c.name]));

  // Validade (vencimento) de uma matrícula liberada.
  const now = Date.now();
  const validityOf = (releasedAt: Date | null, startDate: Date, validityMonths: number | null) => {
    const base = releasedAt ?? startDate;
    if (!validityMonths || validityMonths <= 0) return { validUntil: null as string | null, expired: false };
    const exp = new Date(base);
    exp.setMonth(exp.getMonth() + validityMonths);
    return { validUntil: exp.toISOString(), expired: exp.getTime() < now };
  };

  const employees = members.map((u) => {
    // Conjunto de cursos do funcionário que estão EM DIA (aprovado +
    // certificado liberado + dentro da validade).
    const okCodes = new Set(
      u.enrollments
        .filter((e) => {
          const v = validityOf(e.releasedAt, e.startDate, e.course.validityMonths ?? null);
          return e.passed && e.certificateCode && e.released && !v.expired;
        })
        .map((e) => e.course.code),
    );
    const roleCodes = ((u.jobRole?.courseCodes as unknown as string[]) ?? []).filter(Boolean);
    const trilha = u.jobRole
      ? {
          roleId: u.jobRole.id,
          roleName: u.jobRole.name,
          items: roleCodes.map((code) => ({
            code,
            name: trilhaCodeToName.get(code) ?? code,
            done: okCodes.has(code),
          })),
        }
      : null;
    return {
    id: u.id,
    name: u.name,
    email: u.email,
    cpf: u.cpf,
    jobRoleId: u.jobRoleId ?? null,
    jobRoleName: u.jobRole?.name ?? null,
    trilha,
    enrollments: u.enrollments.map((e) => {
      const v = validityOf(e.releasedAt, e.startDate, e.course.validityMonths ?? null);
      return {
        courseName: e.course.name,
        courseCode: e.course.code,
        workload: e.course.duration,
        progress: e.progress,
        passed: e.passed,
        score: e.examScore,
        certificateCode: e.certificateCode,
        released: e.released,
        validUntil: v.validUntil,
        expired: v.expired,
        date: e.startDate,
      };
    }),
    };
  });

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

  // Conjunto de cursos EM DIA (aprovado + certificado liberado + não vencido)
  // por funcionário — base da conformidade real perante a fiscalização.
  const completedSets = employees.map(
    (e) => new Set(e.enrollments.filter((en) => en.passed && en.certificateCode && en.released && !en.expired).map((en) => en.courseCode)),
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
    jobRoles: jobRoles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      courseCodes: ((r.courseCodes as unknown as string[]) ?? []).filter(Boolean),
    })),
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

// Atribui (ou remove) a trilha de cargo/função de um funcionário da empresa.
companyRouter.patch('/employees/:id/job-role', async (req: AuthedRequest, res: Response) => {
  const companyId = await requireCompany(req, res);
  if (!companyId) return;
  const parsed = z.object({ jobRoleId: z.string().nullable() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Cargo inválido.' });

  const employee = await prisma.user.findFirst({ where: { id: req.params.id, companyId, role: 'STUDENT' } });
  if (!employee) return res.status(404).json({ error: 'Funcionário não encontrado.' });

  if (parsed.data.jobRoleId) {
    const role = await prisma.jobRole.findFirst({ where: { id: parsed.data.jobRoleId, isActive: true } });
    if (!role) return res.status(404).json({ error: 'Cargo não encontrado.' });
  }

  await prisma.user.update({ where: { id: employee.id }, data: { jobRoleId: parsed.data.jobRoleId } });
  res.json({ ok: true });
});

// --- eSocial S-2245: leitura dos treinamentos concluídos (para a empresa
// importar/transmitir). Retorna os registros estruturados + pendências. ---
companyRouter.get('/esocial/s2245', async (req: AuthedRequest, res: Response) => {
  const companyId = await requireCompany(req, res);
  if (!companyId) return;
  const from = typeof req.query.from === 'string' ? req.query.from : undefined;
  const to = typeof req.query.to === 'string' ? req.query.to : undefined;
  const { company, records } = await buildS2245Records(companyId, from, to);
  res.json({ company, records });
});

// Download do XML (rascunho, um evento por trabalhador) ou CSV do período.
companyRouter.get('/esocial/s2245/export', async (req: AuthedRequest, res: Response) => {
  const companyId = await requireCompany(req, res);
  if (!companyId) return;
  const from = typeof req.query.from === 'string' ? req.query.from : undefined;
  const to = typeof req.query.to === 'string' ? req.query.to : undefined;
  const format = req.query.format === 'csv' ? 'csv' : 'xml';
  const { records } = await buildS2245Records(companyId, from, to);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="s2245.csv"');
    // BOM p/ acentuação correta no Excel.
    return res.send('﻿' + recordsToCsv(records));
  }

  // Um evento evtTreiCap por treinamento (treiCap é maxOccurs=1 no XSD).
  const xml = generateS2245Xml(records);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="s2245-rascunho.xml"');
  res.send(xml);
});
