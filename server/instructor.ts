/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel do Instrutor: rotas com escopo restrito aos cursos em que o instrutor
 * (role INSTRUCTOR) está associado. O vínculo é feito pelo nome do usuário de
 * login, que deve coincidir com o nome cadastrado em Instructor.
 *
 * No painel o instrutor: revisa/valida as provas dos seus cursos e acompanha o
 * número de vendas e matrículas de cada curso associado.
 */

import { Router, type Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { authenticate, type AuthedRequest } from './auth';
import { sendCertificateEmail } from './email';

export const instructorRouter = Router();

instructorRouter.use(authenticate);

const norm = (s: string) => s.trim().toLowerCase();

// Cursos (ids) do instrutor autenticado — usado para limitar o escopo das ações.
async function instructorCourseIds(userName: string): Promise<Set<string>> {
  const links = await prisma.instructor.findMany({ select: { name: true, courseId: true } });
  return new Set(links.filter((l) => norm(l.name) === norm(userName)).map((l) => l.courseId));
}

// Escopo de cursos do usuário no painel. O ADMIN master enxerga TODOS os cursos
// (acesso de instrutor geral); o instrutor enxerga apenas os seus (por nome).
async function scopedCourseIds(user: { role: string; name: string }): Promise<Set<string>> {
  if (user.role === 'ADMIN') {
    const all = await prisma.course.findMany({ select: { id: true } });
    return new Set(all.map((c) => c.id));
  }
  return instructorCourseIds(user.name);
}

// Permite acesso ao painel: instrutor OU admin master.
const canUsePanel = (role?: string) => role === 'INSTRUCTOR' || role === 'ADMIN';

// Libera/valida (ou revoga) uma prova — apenas dos cursos do próprio instrutor.
// Ao liberar uma prova APROVADA, o certificado da matrícula é homologado
// (released=true) e o e-mail de certificado é enviado ao aluno. Ao revogar, o
// certificado volta a ficar pendente (released=false) e deixa de ser válido.
instructorRouter.patch('/exams/:id/validate', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || !canUsePanel(user.role)) return res.status(403).json({ error: 'Acesso restrito ao instrutor.' });
  const parsed = z.object({ validated: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.' });
  const sub = await prisma.examSubmission.findUnique({ where: { id: req.params.id } });
  if (!sub) return res.status(404).json({ error: 'Prova não encontrada.' });
  const mine = await scopedCourseIds(user);
  if (!mine.has(sub.courseId)) return res.status(403).json({ error: 'Esta prova não pertence aos seus cursos.' });

  const validated = parsed.data.validated;
  await prisma.examSubmission.update({
    where: { id: sub.id },
    data: { validatedByInstructor: validated, validatedAt: validated ? new Date() : null },
  });

  // Gate do certificado: homologa (ou revoga) a emissão na matrícula do aluno.
  const enr = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: sub.userId, courseId: sub.courseId } },
    include: { user: true, course: true },
  });
  if (enr) {
    if (validated && enr.passed) {
      // Garante um código de certificado (caso ainda não exista).
      let certificateCode = enr.certificateCode;
      if (!certificateCode) {
        const firstName = (enr.user.name.split(' ')[0] || 'ALUNO').toUpperCase();
        const code = enr.course.code.replace(/\s+/g, '');
        certificateCode = `CERT-${code}-${firstName}-${Math.floor(Math.random() * 899 + 100)}`;
      }
      await prisma.enrollment.update({
        where: { id: enr.id },
        data: { released: true, releasedAt: new Date(), certificateCode },
      });
      // E-mail de certificado liberado (fire-and-forget).
      void sendCertificateEmail({ name: enr.user.name, email: enr.user.email }, enr.course.name, certificateCode);
    } else if (!validated) {
      await prisma.enrollment.update({
        where: { id: enr.id },
        data: { released: false, releasedAt: null },
      });
    }
  }

  res.json({ ok: true, released: validated && Boolean(enr?.passed) });
});

// Nome do responsável técnico geral (pode solicitar revogação em qualquer curso).
async function generalResponsibleName(): Promise<string> {
  const row = await prisma.siteContent.findUnique({ where: { key: 'tech_responsible' } });
  const data = Array.isArray(row?.data) ? (row!.data as Array<{ name?: string }>) : [];
  return data[0]?.name || 'Magnus Leandro de Souza';
}

// Etapa 1 da revogação: o instrutor (dos seus cursos) OU o responsável técnico
// geral SOLICITA a revogação do certificado. A revogação definitiva é do admin.
instructorRouter.post('/enrollments/:id/request-revocation', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || !canUsePanel(user.role)) return res.status(403).json({ error: 'Acesso restrito ao instrutor/responsável.' });
  const parsed = z.object({ reason: z.string().min(3).max(500) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Informe o motivo da revogação (mínimo 3 caracteres).' });

  const enr = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
  if (!enr) return res.status(404).json({ error: 'Matrícula/certificado não encontrado.' });

  const isGeneral = user.role === 'ADMIN' || norm(user.name) === norm(await generalResponsibleName());
  const mine = await scopedCourseIds(user);
  if (!isGeneral && !mine.has(enr.courseId)) {
    return res.status(403).json({ error: 'Este certificado não pertence aos seus cursos.' });
  }
  if (enr.revoked) return res.status(400).json({ error: 'Certificado já revogado definitivamente.' });
  if (!enr.released || !enr.certificateCode) return res.status(400).json({ error: 'Só é possível solicitar a revogação de um certificado já emitido.' });

  await prisma.enrollment.update({
    where: { id: enr.id },
    data: { revocationRequested: true, revocationReason: parsed.data.reason, revocationRequestedBy: user.name, revocationRequestedAt: new Date() },
  });
  res.json({ ok: true });
});

// Edição dos slides de um treinamento — apenas dos cursos do próprio instrutor.
instructorRouter.patch('/courses/:id/slides', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || !canUsePanel(user.role)) return res.status(403).json({ error: 'Acesso restrito ao instrutor.' });
  const parsed = z
    .object({ slides: z.array(z.object({ title: z.string().min(1), bullets: z.array(z.string().min(1)), images: z.array(z.string().min(1)).optional() })) })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Slides inválidos. Cada slide precisa de título e ao menos um tópico.' });
  const mine = await scopedCourseIds(user);
  if (!mine.has(req.params.id)) return res.status(403).json({ error: 'Este treinamento não pertence aos seus cursos.' });
  await prisma.course.update({
    where: { id: req.params.id },
    data: { slides: parsed.data.slides as unknown as Prisma.InputJsonValue },
  });
  res.json({ ok: true });
});

// Edição da prova de um treinamento — apenas dos cursos do próprio instrutor.
instructorRouter.patch('/courses/:id/exam', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || !canUsePanel(user.role)) return res.status(403).json({ error: 'Acesso restrito ao instrutor.' });
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
  for (const q of parsed.data.questions) {
    if (q.correctIndex >= q.options.length) return res.status(400).json({ error: 'Há uma questão com resposta correta fora das alternativas.' });
  }
  const mine = await scopedCourseIds(user);
  if (!mine.has(req.params.id)) return res.status(403).json({ error: 'Este treinamento não pertence aos seus cursos.' });
  await prisma.course.update({
    where: { id: req.params.id },
    data: { examQuestions: parsed.data.questions as unknown as Prisma.InputJsonValue },
  });
  res.json({ ok: true });
});

instructorRouter.get('/me', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || !canUsePanel(user.role)) {
    return res.status(403).json({ error: 'Acesso restrito ao instrutor.' });
  }

  // Cursos do instrutor (associação por nome cadastrado em Instructor).
  // O ADMIN master enxerga TODOS os cursos (acesso de instrutor geral).
  const links = await prisma.instructor.findMany({
    include: { course: { select: { id: true, code: true, name: true, price: true, examQuestions: true } } },
  });
  const mine = user.role === 'ADMIN' ? links : links.filter((l) => norm(l.name) === norm(user.name));
  const courseMap = new Map<string, { id: string; code: string; name: string; price: number; examQuestions: unknown }>();
  for (const l of mine) courseMap.set(l.course.id, l.course);
  const courseIds = [...courseMap.keys()];

  // Vendas (pedidos pagos) e matrículas por curso.
  const courses = await Promise.all(
    [...courseMap.values()].map(async (c) => {
      const [sales, enrollments, examsCount, approved] = await Promise.all([
        prisma.order.count({ where: { status: 'PAID', courseIds: { has: c.id } } }),
        prisma.enrollment.count({ where: { courseId: c.id } }),
        prisma.examSubmission.count({ where: { courseId: c.id } }),
        prisma.examSubmission.count({ where: { courseId: c.id, passed: true } }),
      ]);
      return {
        id: c.id, code: c.code, name: c.name,
        examQuestions: Array.isArray(c.examQuestions) ? c.examQuestions : [],
        sales, enrollments, examsCount, approved,
        revenue: Number((((c.price ?? 0) * sales)).toFixed(2)), // faturamento (preço × vendas)
      };
    }),
  );

  // Provas (submissões) dos cursos do instrutor, para revisão/validação.
  const submissions = courseIds.length
    ? await prisma.examSubmission.findMany({
        where: { courseId: { in: courseIds } },
        include: { user: { select: { name: true, cpf: true } }, course: { select: { code: true, name: true } } },
        orderBy: { date: 'desc' },
      })
    : [];

  // Mapa de matrículas (para status de certificado/revogação por aluno+curso).
  const enrRows = courseIds.length
    ? await prisma.enrollment.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true, userId: true, courseId: true, released: true, certificateCode: true, revocationRequested: true, revoked: true },
      })
    : [];
  const enrMap = new Map(enrRows.map((e) => [`${e.userId}_${e.courseId}`, e]));

  const exams = submissions.map((s) => {
    const e = enrMap.get(`${s.userId}_${s.courseId}`);
    return {
      id: s.id,
      studentName: s.user.name,
      studentCpf: s.user.cpf,
      courseId: s.courseId,
      courseCode: s.course.code,
      courseName: s.course.name,
      score: s.score,
      passed: s.passed,
      validated: s.validatedByInstructor,
      answers: s.answers as Record<number, number>,
      date: s.date,
      // Certificado / revogação
      enrollmentId: e?.id ?? null,
      released: e?.released ?? false,
      certificateCode: e?.certificateCode ?? null,
      revocationRequested: e?.revocationRequested ?? false,
      revoked: e?.revoked ?? false,
    };
  });

  // Percentual de comissão definido pelo admin (SiteContent "commissions").
  const commRow = await prisma.siteContent.findUnique({ where: { key: 'commissions' } });
  const commList = Array.isArray(commRow?.data) ? (commRow!.data as Array<{ name?: string; percent?: number }>) : [];
  const myComm = commList.find((c) => norm(c?.name ?? '') === norm(user.name));
  const commissionPercent = myComm ? Number(myComm.percent) || 0 : 0;
  const totalRevenue = Number(courses.reduce((a, c) => a + c.revenue, 0).toFixed(2));
  const commissionValue = Number((totalRevenue * (commissionPercent / 100)).toFixed(2));

  res.json({
    instructor: { name: user.name },
    courses,
    exams,
    stats: {
      courses: courses.length,
      totalSales: courses.reduce((a, c) => a + c.sales, 0),
      totalEnrollments: courses.reduce((a, c) => a + c.enrollments, 0),
      totalExams: exams.length,
      totalRevenue,
      commissionPercent,
      commissionValue,
    },
  });
});
