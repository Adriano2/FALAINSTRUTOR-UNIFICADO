/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Integração de pagamentos com o Asaas (PIX, Boleto e Cartão) via página de
 * cobrança hospedada (invoiceUrl) + confirmação por webhook.
 *
 * A chave do Asaas fica somente no servidor. O valor é sempre calculado no
 * servidor a partir dos preços do banco (nunca confiamos no cliente).
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { prisma } from './db';
import { authenticate, type AuthedRequest } from './auth';

const ENV_ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ENV_ASAAS_ENV = process.env.ASAAS_ENV;
const ENV_ASAAS_BASE_URL = process.env.ASAAS_BASE_URL;
const ENV_ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;
const PUBLIC_URL =
  process.env.PUBLIC_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${process.env.PORT || 8787}`;

function baseUrlFor(env?: string | null): string {
  if (ENV_ASAAS_BASE_URL) return ENV_ASAAS_BASE_URL;
  return env === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3';
}

// Resolve a configuração ativa do Asaas: PRIORIZA o que foi salvo no painel
// (Configurações → pagamento), caindo para as variáveis de ambiente.
export async function resolveAsaas(): Promise<{ key: string | null; baseUrl: string; webhookToken: string | null }> {
  let token: string | null = null;
  let env: string | null = ENV_ASAAS_ENV ?? null;
  let webhookToken: string | null = ENV_ASAAS_WEBHOOK_TOKEN ?? null;
  try {
    const cfg = await prisma.appConfig.findUnique({ where: { id: 'singleton' } });
    const p = (cfg?.payment ?? {}) as Record<string, unknown>;
    if (typeof p.asaasToken === 'string' && p.asaasToken.trim()) token = p.asaasToken.trim();
    if (typeof p.asaasEnv === 'string' && p.asaasEnv.trim()) env = p.asaasEnv.trim();
    if (typeof p.asaasWebhookToken === 'string' && p.asaasWebhookToken.trim()) webhookToken = p.asaasWebhookToken.trim();
  } catch {
    /* sem banco: usa o ambiente */
  }
  if (!token) token = ENV_ASAAS_API_KEY ?? null;
  return { key: token, baseUrl: baseUrlFor(env), webhookToken };
}

// Mantido para o /health (configuração via ambiente). O /status reflete o painel.
export const paymentsConfigured = Boolean(ENV_ASAAS_API_KEY);

export async function asaas<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const { key, baseUrl } = await resolveAsaas();
  if (!key) throw new Error('Asaas não configurado (defina a chave no painel ou ASAAS_API_KEY).');
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // O Asaas recomenda um User-Agent identificável nas requisições.
      'User-Agent': 'FalaInstrutor/1.0',
      access_token: key,
      ...(options.headers as Record<string, string>),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as any)?.errors?.[0]?.description || 'Falha na comunicação com o Asaas.';
    throw new Error(msg);
  }
  return data as T;
}

// Garante um cliente Asaas para o usuário (cacheia o id no banco).
async function getOrCreateCustomer(user: { id: string; name: string; email: string; cpf: string; asaasCustomerId: string | null }) {
  if (user.asaasCustomerId) return user.asaasCustomerId;
  const created = await asaas<{ id: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify({ name: user.name, email: user.email, cpfCnpj: user.cpf.replace(/\D/g, '') }),
  });
  await prisma.user.update({ where: { id: user.id }, data: { asaasCustomerId: created.id } });
  return created.id;
}

// Calcula subtotal/desconto no servidor a partir do banco (autoritativo).
async function computeTotal(courseIds: string[], couponCode?: string) {
  const courses = await prisma.course.findMany({ where: { id: { in: courseIds }, isActive: true } });
  const subtotal = courses.reduce((acc, c) => acc + c.price, 0);
  let discount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({ where: { code: couponCode.toUpperCase(), isActive: true } });
    if (coupon) {
      // associatedProducts vazio => cupom vale para TODOS os cursos.
      const allCourses = coupon.associatedProducts.length === 0;
      const eligible = courses
        .filter((c) => allCourses || coupon.associatedProducts.includes(c.id))
        .reduce((acc, c) => acc + c.price, 0);
      discount = coupon.type === 'PERCENTAGE' ? (eligible * coupon.value) / 100 : Math.min(eligible, coupon.value);
    }
  }
  const total = Math.max(0, Number((subtotal - discount).toFixed(2)));
  return { courses, subtotal, discount: Number(discount.toFixed(2)), total };
}

// Cria as matrículas e a transação de um pedido pago (idempotente).
async function fulfillOrder(orderId: string, paymentId?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status === 'PAID') return;

  await prisma.$transaction(async (tx) => {
    for (const courseId of order.courseIds) {
      const exists = await tx.enrollment.findUnique({ where: { userId_courseId: { userId: order.userId, courseId } } });
      if (!exists) await tx.enrollment.create({ data: { userId: order.userId, courseId } });
    }
    const codes = await tx.course.findMany({ where: { id: { in: order.courseIds } }, select: { code: true } });
    await tx.transaction.create({
      data: {
        userId: order.userId,
        courseName: codes.map((c) => c.code).join(' + '),
        total: order.total,
        discount: order.discount,
        status: 'ACTIVE',
        installments: 1,
        couponCode: order.couponCode ?? undefined,
      },
    });
    await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', paymentId: paymentId ?? order.paymentId } });
  });
}

// Marca a assinatura corporativa como ativa e renova a data de vencimento ao
// confirmar um pagamento recorrente (idempotente).
async function fulfillSubscriptionPayment(subscriptionId: string, dueDateISO?: string) {
  const company = await prisma.company.findFirst({ where: { asaasSubscriptionId: subscriptionId } });
  if (!company) return;
  // Próxima renovação: vencimento do ciclo + 1 mês (ou hoje + 1 mês).
  const base = dueDateISO ? new Date(dueDateISO) : new Date();
  const renews = new Date(base);
  renews.setMonth(renews.getMonth() + 1);
  await prisma.company.update({
    where: { id: company.id },
    data: { subscriptionStatus: 'active', subscriptionRenewsAt: renews },
  });
}

export const paymentsRouter = Router();

// Status da configuração (não vaza segredos). Reflete painel OU ambiente.
paymentsRouter.get('/status', async (_req, res) => {
  const { key } = await resolveAsaas();
  res.json({ configured: Boolean(key) });
});

// Inicia o checkout: cria o pedido + cobrança no Asaas e devolve a URL.
paymentsRouter.post('/checkout', authenticate, async (req: AuthedRequest, res: Response) => {
  const { key } = await resolveAsaas();
  if (!key) {
    return res.status(503).json({ error: 'Pagamento ainda não configurado (defina a chave Asaas no painel ou ASAAS_API_KEY).' });
  }
  const parsed = z
    .object({ courseIds: z.array(z.string()).min(1), couponCode: z.string().optional(), partnerSlug: z.string().max(60).optional() })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Itens do pedido inválidos.' });

  // Atribui a venda ao parceiro white-label de origem (se houver e estiver ativo).
  let partnerSlug: string | null = null;
  if (parsed.data.partnerSlug) {
    const slug = parsed.data.partnerSlug.toLowerCase();
    const partner = await prisma.partner.findFirst({ where: { slug, isActive: true } });
    if (partner) partnerSlug = partner.slug;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const { courses, discount, total } = await computeTotal(parsed.data.courseIds, parsed.data.couponCode);
  if (courses.length === 0) return res.status(400).json({ error: 'Nenhum curso válido no pedido.' });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      courseIds: courses.map((c) => c.id),
      total,
      discount,
      couponCode: parsed.data.couponCode,
      partnerSlug,
    },
  });

  try {
    const customerId = await getOrCreateCustomer(user);
    const dueDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const payment = await asaas<{ id: string; invoiceUrl: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED', // o aluno escolhe PIX, Boleto ou Cartão
        value: total,
        dueDate,
        description: `FalaInstrutor • ${courses.map((c) => c.code).join(', ')}`,
        externalReference: order.id,
        callback: { successUrl: `${PUBLIC_URL}/?payment=success&order=${order.id}`, autoRedirect: true },
      }),
    });
    await prisma.order.update({ where: { id: order.id }, data: { paymentId: payment.id, paymentUrl: payment.invoiceUrl } });
    res.json({ url: payment.invoiceUrl, orderId: order.id });
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
    res.status(502).json({ error: err instanceof Error ? err.message : 'Falha ao criar a cobrança.' });
  }
});

// Consulta o status de um pedido (usado na página de retorno).
paymentsRouter.get('/order/:id', authenticate, async (req: AuthedRequest, res: Response) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.userId !== req.user!.sub) return res.status(404).json({ error: 'Pedido não encontrado.' });
  res.json({ status: order.status });
});

// Webhook do Asaas: confirma o pagamento e provisiona as matrículas.
paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  const { webhookToken } = await resolveAsaas();
  if (webhookToken && req.headers['asaas-access-token'] !== webhookToken) {
    return res.status(401).json({ error: 'Webhook não autorizado.' });
  }
  const event = req.body?.event as string | undefined;
  const payment = req.body?.payment as { externalReference?: string; id?: string; subscription?: string; dueDate?: string } | undefined;

  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
    try {
      // Pagamento de assinatura recorrente (plano da empresa).
      if (payment?.subscription) {
        await fulfillSubscriptionPayment(payment.subscription, payment.dueDate);
      } else if (payment?.externalReference) {
        // Pagamento de pedido avulso (cursos).
        await fulfillOrder(payment.externalReference, payment.id);
      }
    } catch (err) {
      console.error('[asaas webhook] erro ao processar pagamento:', err);
      return res.status(500).json({ error: 'Erro ao processar o pagamento.' });
    }
  }
  // Sempre 200 para o Asaas não reenviar indefinidamente eventos já tratados.
  res.json({ received: true });
});
