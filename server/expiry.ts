/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gestão de vencimento de certificados: lista os certificados emitidos com a
 * data de validade calculada (liberação + validade do curso) e dispara alertas
 * de renovação (e-mail ao aluno + resumo por WhatsApp aos responsáveis).
 */

import { prisma } from './db';
import { sendExpiryAlert } from './email';
import { sendWhatsAppToResponsibles } from './whatsapp';

export interface ExpirationRow {
  enrollmentId: string;
  studentName: string;
  studentEmail: string;
  company: string | null;
  courseCode: string;
  courseName: string;
  certificateCode: string | null;
  validUntil: string | null; // ISO
  daysLeft: number | null;
  status: 'valid' | 'expiring' | 'expired';
  notifiedAt: string | null;
}

const DAY = 86_400_000;

// Janela padrão (dias) para considerar "a vencer".
export const EXPIRING_WINDOW_DAYS = 60;

function computeValidUntil(base: Date | null, validityMonths: number | null): Date | null {
  if (!base || !validityMonths || validityMonths <= 0) return null;
  const d = new Date(base);
  d.setMonth(d.getMonth() + validityMonths);
  return d;
}

// Lista os certificados emitidos (liberados e não revogados) com vencimento.
// windowDays: filtra para mostrar apenas os "a vencer/vencidos" (se informado).
export async function listExpirations(windowDays?: number, now: Date = new Date()): Promise<ExpirationRow[]> {
  const rows = await prisma.enrollment.findMany({
    where: { released: true, revoked: false, certificateCode: { not: null } },
    include: {
      user: { select: { name: true, email: true, company: { select: { name: true } } } },
      course: { select: { code: true, name: true, validityMonths: true } },
    },
  });

  const out: ExpirationRow[] = [];
  for (const e of rows) {
    const base = e.releasedAt ?? e.startDate;
    const exp = computeValidUntil(base, e.course.validityMonths ?? null);
    if (!exp) continue; // curso sem validade definida
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / DAY);
    const status: ExpirationRow['status'] = daysLeft < 0 ? 'expired' : daysLeft <= EXPIRING_WINDOW_DAYS ? 'expiring' : 'valid';
    if (windowDays !== undefined && daysLeft > windowDays) continue;
    out.push({
      enrollmentId: e.id,
      studentName: e.user.name,
      studentEmail: e.user.email,
      company: e.user.company?.name ?? null,
      courseCode: e.course.code,
      courseName: e.course.name,
      certificateCode: e.certificateCode,
      validUntil: exp.toISOString(),
      daysLeft,
      status,
      notifiedAt: e.expiryNotifiedAt ? e.expiryNotifiedAt.toISOString() : null,
    });
  }
  // Mais urgentes primeiro.
  out.sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
  return out;
}

// Dispara os alertas de renovação. Notifica certificados que vencem em até
// `daysAhead` dias (ou já vencidos), respeitando um intervalo mínimo entre
// reenvios (`minResendDays`).
export async function runExpiryAlerts(daysAhead = 30, minResendDays = 15, now: Date = new Date()): Promise<{ sent: number; candidates: number }> {
  const all = await listExpirations(daysAhead, now);
  const candidates = all.filter((r) => r.status === 'expiring' || r.status === 'expired');

  let sent = 0;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  for (const r of candidates) {
    // Evita reenvio se já notificado recentemente.
    if (r.notifiedAt && now.getTime() - new Date(r.notifiedAt).getTime() < minResendDays * DAY) continue;
    if (!r.validUntil) continue;
    const ok = await sendExpiryAlert(
      { name: r.studentName, email: r.studentEmail },
      `${r.courseCode} — ${r.courseName}`,
      fmt(r.validUntil),
      r.status === 'expired',
    );
    if (ok) {
      await prisma.enrollment.update({ where: { id: r.enrollmentId }, data: { expiryNotifiedAt: now } }).catch(() => {});
      sent++;
    }
  }

  // Resumo por WhatsApp aos responsáveis.
  if (candidates.length > 0) {
    const vencidos = candidates.filter((c) => c.status === 'expired').length;
    const aVencer = candidates.length - vencidos;
    await sendWhatsAppToResponsibles(
      `📋 FalaInstrutor — Vencimentos\nA vencer (≤${daysAhead}d): ${aVencer}\nVencidos: ${vencidos}\nAlertas enviados aos alunos: ${sent}`,
    ).catch(() => {});
  }

  return { sent, candidates: candidates.length };
}
