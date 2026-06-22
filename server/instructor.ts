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

// Libera/valida (ou revoga) uma prova — apenas dos cursos do próprio instrutor.
// Ao liberar uma prova APROVADA, o certificado da matrícula é homologado
// (released=true) e o e-mail de certificado é enviado ao aluno. Ao revogar, o
// certificado volta a ficar pendente (released=false) e deixa de ser válido.
instructorRouter.patch('/exams/:id/validate', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || user.role !== 'INSTRUCTOR') return res.status(403).json({ error: 'Acesso restrito ao instrutor.' });
  const parsed = z.object({ validated: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.' });
  const sub = await prisma.examSubmission.findUnique({ where: { id: req.params.id } });
  if (!sub) return res.status(404).json({ error: 'Prova não encontrada.' });
  const mine = await instructorCourseIds(user.name);
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

instructorRouter.get('/me', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Acesso restrito ao instrutor.' });
  }

  // Cursos do instrutor (associação por nome cadastrado em Instructor).
  const links = await prisma.instructor.findMany({
    include: { course: { select: { id: true, code: true, name: true, price: true, examQuestions: true } } },
  });
  const mine = links.filter((l) => norm(l.name) === norm(user.name));
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

  const exams = submissions.map((s) => ({
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
  }));

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
