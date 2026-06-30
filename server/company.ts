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
import { asaas, resolveAsaas } from './payments';

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

  const company = await prisma.company.findUnique({ where: { id: companyId }, include: { plan: true } });
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
          subscription: {
            planId: company.planId,
            planName: company.plan?.name ?? null,
            priceMonthly: company.plan?.priceMonthly ?? null,
            status: company.subscriptionStatus,
            renewsAt: company.subscriptionRenewsAt,
            active: company.subscriptionStatus === 'active',
          },
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

// --- Assinatura recorrente (plano corporativo) ---

// Garante um cliente Asaas para a empresa (cacheia o id), usando o CNPJ.
async function getOrCreateCompanyCustomer(company: { id: string; name: string; email: string | null; cnpj: string | null; asaasCustomerId: string | null }): Promise<string> {
  if (company.asaasCustomerId) return company.asaasCustomerId;
  const created = await asaas<{ id: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: company.name,
      email: company.email ?? undefined,
      cpfCnpj: (company.cnpj ?? '').replace(/\D/g, ''),
    }),
  });
  await prisma.company.update({ where: { id: company.id }, data: { asaasCustomerId: created.id } });
  return created.id;
}

// Assina (ou troca) um plano: cria a assinatura mensal no Asaas e devolve a URL
// da primeira fatura para a empresa pagar.
companyRouter.post('/subscription', async (req: AuthedRequest, res: Response) => {
  const companyId = await requireCompany(req, res);
  if (!companyId) return;
  const { key } = await resolveAsaas();
  if (!key) return res.status(503).json({ error: 'Pagamento ainda não configurado.' });

  const parsed = z.object({ planId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Plano inválido.' });

  const plan = await prisma.plan.findFirst({ where: { id: parsed.data.planId, isActive: true } });
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado.' });
  if (plan.priceMonthly <= 0) return res.status(400).json({ error: 'Plano sem valor mensal definido.' });

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada.' });
  if (!(company.cnpj ?? '').replace(/\D/g, '')) return res.status(400).json({ error: 'Cadastre o CNPJ da empresa antes de assinar.' });

  try {
    // Cancela a assinatura anterior (troca de plano), se houver.
    if (company.asaasSubscriptionId) {
      await asaas(`/subscriptions/${company.asaasSubscriptionId}`, { method: 'DELETE' }).catch(() => {});
    }

    const customerId = await getOrCreateCompanyCustomer(company);
    const nextDueDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const sub = await asaas<{ id: string }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED', // PIX, Boleto ou Cartão por fatura
        value: plan.priceMonthly,
        nextDueDate,
        cycle: 'MONTHLY',
        description: `FalaInstrutor • Plano ${plan.name}`,
        externalReference: company.id,
      }),
    });

    await prisma.company.update({
      where: { id: company.id },
      data: { planId: plan.id, asaasSubscriptionId: sub.id, subscriptionStatus: 'pending' },
    });

    // Recupera a URL da primeira fatura para pagamento imediato.
    let url: string | null = null;
    try {
      const pays = await asaas<{ data: { invoiceUrl: string }[] }>(`/subscriptions/${sub.id}/payments`);
      url = pays.data?.[0]?.invoiceUrl ?? null;
    } catch { /* fatura ainda não gerada */ }

    res.json({ subscriptionId: sub.id, url });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Falha ao criar a assinatura.' });
  }
});

// Cancela a assinatura recorrente da empresa.
companyRouter.post('/subscription/cancel', async (req: AuthedRequest, res: Response) => {
  const companyId = await requireCompany(req, res);
  if (!companyId) return;
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company?.asaasSubscriptionId) return res.status(400).json({ error: 'Nenhuma assinatura ativa.' });
  try {
    await asaas(`/subscriptions/${company.asaasSubscriptionId}`, { method: 'DELETE' }).catch(() => {});
    await prisma.company.update({
      where: { id: company.id },
      data: { subscriptionStatus: 'canceled', asaasSubscriptionId: null },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Falha ao cancelar a assinatura.' });
  }
});
