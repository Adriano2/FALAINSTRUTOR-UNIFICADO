/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gamificação + Microlearning do aluno.
 *
 * - XP e níveis: XP vem das conclusões de curso/prova (derivado) + das pílulas
 *   diárias (persistido em User.xp). Nível é linear (LEVEL_SIZE por nível).
 * - Streak (ofensiva 🔥): dias consecutivos respondendo a "Pílula do Dia".
 * - Conquistas (badges): calculadas a partir das matrículas + streak.
 * - Microlearning: "Pílula do Dia" — 1 questão/dia sorteada do banco de provas
 *   dos cursos do aluno; feedback imediato e XP (uma vez por dia).
 */

import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from './db';
import { authenticate, type AuthedRequest } from './auth';

export const gamificationRouter = Router();
gamificationRouter.use(authenticate);

const LEVEL_SIZE = 150; // XP por nível
const XP_COURSE = 100; // XP por curso concluído
const XP_PERFECT = 25; // bônus por prova com nota 100
const XP_MICRO_OK = 10; // XP por pílula correta
const XP_MICRO_TRY = 3; // XP por pílula respondida (errada)

interface ExamQ { question: string; options: string[]; correctIndex: number }

// Data-calendário no fuso de Brasília (AAAA-MM-DD).
function brtToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}
function brtYesterday(): string {
  const d = new Date(Date.now() - 86400000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

// Estatísticas de aprendizado do aluno a partir das matrículas.
async function learnStats(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: { select: { examQuestions: true } } },
  });
  const completed = enrollments.filter((e) => e.passed && e.certificateCode && e.released && !e.revoked).length;
  const perfect = enrollments.filter((e) => (e.examScore ?? 0) >= 100).length;
  const inProgress = enrollments.filter((e) => !e.passed).length;
  return { enrollments, completed, perfect, inProgress };
}

function computeBadges(completed: number, perfect: number, streak: number) {
  return [
    { id: 'first', label: 'Primeiro Passo', icon: '🎓', description: 'Concluiu o 1º treinamento', earned: completed >= 1 },
    { id: 'dedicated', label: 'Dedicado', icon: '📚', description: 'Concluiu 3 treinamentos', earned: completed >= 3 },
    { id: 'expert', label: 'Especialista', icon: '🏅', description: 'Concluiu 5 treinamentos', earned: completed >= 5 },
    { id: 'collector', label: 'Colecionador', icon: '🏆', description: 'Concluiu 10 treinamentos', earned: completed >= 10 },
    { id: 'ace', label: 'Nota Máxima', icon: '💯', description: 'Tirou 100 em uma prova', earned: perfect >= 1 },
    { id: 'streak7', label: 'Ofensiva de 7', icon: '🔥', description: '7 dias seguidos de estudo', earned: streak >= 7 },
    { id: 'streak30', label: 'Ofensiva de 30', icon: '⚡', description: '30 dias seguidos de estudo', earned: streak >= 30 },
  ];
}

function levelInfo(totalXp: number) {
  const level = Math.floor(totalXp / LEVEL_SIZE) + 1;
  const xpInLevel = totalXp % LEVEL_SIZE;
  return { level, xpInLevel, xpForNext: LEVEL_SIZE, totalXp };
}

// Painel de gamificação do aluno.
gamificationRouter.get('/me', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  const { completed, perfect, inProgress } = await learnStats(user.id);
  const totalXp = user.xp + completed * XP_COURSE + perfect * XP_PERFECT;
  const badges = computeBadges(completed, perfect, user.streakDays);
  res.json({
    ...levelInfo(totalXp),
    streakDays: user.streakDays,
    answeredToday: user.lastQuizDate === brtToday(),
    stats: { completed, perfect, inProgress },
    badges,
  });
});

// Reúne o banco de questões dos cursos do aluno (fallback: cursos ativos).
async function questionPool(userId: string): Promise<{ courseId: string; qIndex: number; q: ExamQ }[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true, course: { select: { examQuestions: true } } },
  });
  let sources = enrollments.map((e) => ({ courseId: e.courseId, questions: e.course.examQuestions }));
  if (sources.length === 0) {
    const courses = await prisma.course.findMany({ where: { isActive: true }, select: { id: true, examQuestions: true } });
    sources = courses.map((c) => ({ courseId: c.id, questions: c.examQuestions }));
  }
  const pool: { courseId: string; qIndex: number; q: ExamQ }[] = [];
  for (const s of sources) {
    const qs = (Array.isArray(s.questions) ? s.questions : []) as unknown as ExamQ[];
    qs.forEach((q, i) => {
      if (q && Array.isArray(q.options) && q.options.length >= 2) pool.push({ courseId: s.courseId, qIndex: i, q });
    });
  }
  return pool;
}

// Seleção estável por dia+usuário (mesma pílula ao longo do dia).
function pickOfTheDay<T>(pool: T[], seed: string): T | null {
  if (pool.length === 0) return null;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

// Pílula do Dia: devolve a questão SEM o gabarito.
gamificationRouter.get('/micro', async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  const pool = await questionPool(user.id);
  const picked = pickOfTheDay(pool, `${brtToday()}|${user.id}`);
  if (!picked) return res.json({ question: null });
  res.json({
    question: { question: picked.q.question, options: picked.q.options },
    ref: { courseId: picked.courseId, qIndex: picked.qIndex },
    answeredToday: user.lastQuizDate === brtToday(),
  });
});

// Responde a Pílula do Dia: valida no servidor, credita XP e atualiza a ofensiva
// (apenas uma vez por dia).
gamificationRouter.post('/micro', async (req: AuthedRequest, res: Response) => {
  const parsed = z.object({
    courseId: z.string().min(1),
    qIndex: z.number().int().min(0),
    answerIndex: z.number().int().min(0),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Resposta inválida.' });

  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId }, select: { examQuestions: true } });
  const qs = (Array.isArray(course?.examQuestions) ? course!.examQuestions : []) as unknown as ExamQ[];
  const q = qs[parsed.data.qIndex];
  if (!q) return res.status(404).json({ error: 'Questão não encontrada.' });

  const correct = parsed.data.answerIndex === q.correctIndex;
  const today = brtToday();
  const alreadyToday = user.lastQuizDate === today;

  let xpAwarded = 0;
  let streak = user.streakDays;
  if (!alreadyToday) {
    xpAwarded = correct ? XP_MICRO_OK : XP_MICRO_TRY;
    streak = user.lastQuizDate === brtYesterday() ? user.streakDays + 1 : 1;
    await prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: xpAwarded }, streakDays: streak, lastQuizDate: today },
    });
  }

  res.json({
    correct,
    correctIndex: q.correctIndex,
    xpAwarded,
    streakDays: streak,
    alreadyAnswered: alreadyToday,
  });
});
