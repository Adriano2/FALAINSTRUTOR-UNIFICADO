/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Job de alertas de vencimento (executar via cron, ex.: 1x/dia).
 *   cd /var/www/falainstrutor && npx tsx server/jobs/expiry-alerts.ts
 * Envia e-mail de renovação aos alunos com certificado vencendo (≤30 dias) ou
 * vencido, e um resumo por WhatsApp aos responsáveis. Idempotente (respeita o
 * intervalo mínimo de reenvio).
 */

import 'dotenv/config';
import { runExpiryAlerts } from '../expiry';
import { prisma } from '../db';

runExpiryAlerts(30)
  .then((r) => console.log(`[expiry-alerts] enviados ${r.sent}/${r.candidates} candidatos`))
  .catch((e) => { console.error('[expiry-alerts] erro:', e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
