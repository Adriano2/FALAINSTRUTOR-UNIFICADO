/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Restrição de horário de acesso aos treinamentos (definida pela empresa).
 * A avaliação usa o horário de Brasília (America/Sao_Paulo), independente do
 * fuso do servidor (Render roda em UTC).
 */

import { prisma } from './db';

export interface AccessSchedule {
  enabled?: boolean;
  days?: number[]; // 0=Domingo ... 6=Sábado
  start?: string; // "HH:MM"
  end?: string; // "HH:MM"
}

export interface AccessResult {
  allowed: boolean;
  restricted: boolean; // existe restrição ativa configurada
  message?: string;
  schedule?: AccessSchedule;
}

const WD_LABEL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Horário atual em Brasília: dia da semana (0-6) e minutos desde a meia-noite.
function nowSaoPaulo(): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekday = wdMap[parts.find((p) => p.type === 'weekday')?.value ?? 'Sun'] ?? 0;
  const hh = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10) % 24;
  const mm = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  return { weekday, minutes: hh * 60 + mm };
}

const toMinutes = (hhmm?: string): number | null => {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Avalia se o acesso é permitido AGORA, conforme a agenda da empresa.
export function evaluateSchedule(schedule: AccessSchedule | null | undefined): AccessResult {
  if (!schedule || !schedule.enabled) return { allowed: true, restricted: false };
  const { weekday, minutes } = nowSaoPaulo();

  const days = Array.isArray(schedule.days) ? schedule.days : [];
  if (days.length > 0 && !days.includes(weekday)) {
    return {
      allowed: false,
      restricted: true,
      schedule,
      message: `Acesso liberado apenas em: ${days.map((d) => WD_LABEL[d]).join(', ')}.`,
    };
  }

  const start = toMinutes(schedule.start);
  const end = toMinutes(schedule.end);
  if (start != null && end != null) {
    // Faixa normal (08:00–18:00) ou que cruza a meia-noite (22:00–06:00).
    const ok = start <= end ? minutes >= start && minutes <= end : minutes >= start || minutes <= end;
    if (!ok) {
      return {
        allowed: false,
        restricted: true,
        schedule,
        message: `Acesso permitido das ${schedule.start} às ${schedule.end} (horário de Brasília).`,
      };
    }
  }
  return { allowed: true, restricted: true, schedule };
}

// Avalia o acesso para um usuário (aluno) com base na empresa vinculada.
export async function evaluateUserAccess(userId: string): Promise<AccessResult> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { companyId: true, role: true } });
  if (!user || user.role !== 'STUDENT' || !user.companyId) return { allowed: true, restricted: false };
  const company = await prisma.company.findUnique({ where: { id: user.companyId }, select: { accessSchedule: true } });
  return evaluateSchedule(company?.accessSchedule as AccessSchedule | null);
}
