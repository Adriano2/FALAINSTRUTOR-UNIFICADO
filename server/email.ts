/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * E-mails transacionais (boas-vindas, certificado emitido).
 *
 * Provider-agnóstico via API HTTP da Resend (uma chamada fetch, sem dependência
 * extra). Degrada graciosamente: se RESEND_API_KEY / EMAIL_FROM não estiverem
 * configurados, apenas registra no log e não bloqueia o fluxo. O envio é sempre
 * "fire-and-forget" — nunca derruba o cadastro nem a emissão do certificado.
 *
 * Os modelos podem ser editados no painel admin (SiteContent chave "emails",
 * itens { name, subject, body }); caso não exista um modelo correspondente, usa
 * o texto padrão abaixo. Variáveis suportadas: {{nome}}, {{curso}}, {{codigo}},
 * {{link}}.
 */

import { prisma } from './db';

const PUBLIC_URL = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '';

// Escapa HTML de qualquer valor controlado pelo usuário antes de injetar no
// corpo do e-mail — impede injeção de HTML/links de phishing pelo nosso mailer.
const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

// Envia um e-mail. Nunca lança: em erro/sem config, apenas loga.
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!emailConfigured()) {
    console.log(`[email] (não configurado) destino=${to} assunto="${subject}"`);
    return false;
  }
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
    });
    if (!resp.ok) {
      console.warn(`[email] falha ao enviar (${resp.status}) para ${to}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[email] erro de rede ao enviar:', err);
    return false;
  }
}

function applyVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? '');
}

// Busca um modelo editável no painel (por palavra-chave no nome). Opcional.
async function findTemplate(keywords: string[]): Promise<{ subject?: string; body?: string } | null> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: 'emails' } });
    const list = Array.isArray(row?.data) ? (row!.data as any[]) : [];
    const found = list.find((t) => {
      const name = String(t?.name ?? '').toLowerCase();
      return keywords.some((k) => name.includes(k));
    });
    return found ? { subject: found.subject, body: found.body } : null;
  } catch {
    return null;
  }
}

function wrapHtml(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1f2a3a">
    <div style="max-width:560px;margin:0 auto;padding:24px">
      <div style="background:#1f2a44;color:#fff;padding:16px 20px;border-radius:10px 10px 0 0;font-weight:800">FalaInstrutor</div>
      <div style="background:#fff;padding:24px 20px;border-radius:0 0 10px 10px;border:1px solid #e2e8f0;border-top:0;line-height:1.6;font-size:14px">
        <h2 style="margin:0 0 12px;color:#1e9b46">${title}</h2>
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">FalaInstrutor • Segurança e Saúde no Trabalho</p>
    </div>
  </body></html>`;
}

export async function sendWelcomeEmail(user: { name: string; email: string }): Promise<void> {
  const vars = { nome: esc(user.name), curso: '', codigo: '', link: PUBLIC_URL };
  const tpl = await findTemplate(['boas', 'vindas', 'bem-vindo', 'bem vindo', 'welcome']);
  const subject = tpl?.subject ? applyVars(tpl.subject, vars) : 'Bem-vindo(a) ao FalaInstrutor!';
  const body = tpl?.body
    ? applyVars(tpl.body, vars).replace(/\n/g, '<br>')
    : `Olá <strong>${esc(user.name)}</strong>,<br><br>Sua conta foi criada com sucesso na plataforma FalaInstrutor. ` +
      `Você já pode acessar seus treinamentos de Segurança e Saúde no Trabalho.` +
      `<br><br>🎁 <strong>Presente de boas-vindas:</strong> use o cupom <strong style="color:#1e9b46">BEMVINDO10</strong> e ganhe <strong>10% de desconto</strong> na sua primeira compra.` +
      (PUBLIC_URL ? `<br><br><a href="${PUBLIC_URL}" style="background:#1e9b46;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Acessar a plataforma</a>` : '');
  await sendEmail(user.email, subject, wrapHtml('Conta criada com sucesso', body));
}

// Alerta ao aluno de que o certificado de um treinamento está vencendo/vencido,
// com chamada para a renovação (reciclagem).
export async function sendExpiryAlert(
  user: { name: string; email: string },
  courseName: string,
  validUntil: string,
  expired: boolean,
): Promise<boolean> {
  const subject = expired
    ? `Certificado vencido — ${courseName}`
    : `Seu certificado de ${courseName} está vencendo`;
  const cta = PUBLIC_URL
    ? `<br><br><a href="${PUBLIC_URL}" style="background:#1e9b46;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Renovar treinamento</a>`
    : '';
  const body =
    `Olá <strong>${esc(user.name)}</strong>,<br><br>` +
    (expired
      ? `O seu certificado do treinamento <strong>${esc(courseName)}</strong> <span style="color:#e11d48;font-weight:bold">venceu em ${esc(validUntil)}</span>. `
      : `O seu certificado do treinamento <strong>${esc(courseName)}</strong> vence em <strong>${esc(validUntil)}</strong>. `) +
    `Para se manter em conformidade com as Normas Regulamentadoras, faça a <strong>reciclagem/renovação</strong>.` +
    cta;
  return sendEmail(user.email, subject, wrapHtml(expired ? 'Certificado vencido' : 'Renovação de certificado', body));
}

// Notifica a equipe comercial sobre um novo lead captado (landing / agente IA).
// Destinatário: LEADS_NOTIFY_EMAIL (ou ADMIN_EMAIL, ou o EMAIL_FROM).
export async function sendLeadNotification(lead: {
  type: string; name: string; email?: string | null; phone?: string | null;
  company?: string | null; cnpj?: string | null; employeeCount?: number | null;
  interest?: string | null; message?: string | null; source: string;
}): Promise<void> {
  const to = process.env.LEADS_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || '';
  if (!to) return;
  const tipo = lead.type === 'COMPANY' ? 'Empresa' : 'Profissional';
  const origem = lead.source === 'ai-agent' ? 'Agente de IA' : 'Formulário da landing';
  const row = (label: string, value?: string | number | null) =>
    value ? `<tr><td style="padding:4px 10px 4px 0;color:#64748b">${esc(label)}</td><td style="padding:4px 0;font-weight:bold">${esc(value)}</td></tr>` : '';
  const body =
    `Um novo lead foi captado pela <strong>${origem}</strong>.<br><br>` +
    `<table style="font-size:14px;border-collapse:collapse">` +
    row('Tipo', tipo) +
    row('Nome', lead.name) +
    row('E-mail', lead.email ?? undefined) +
    row('Telefone', lead.phone ?? undefined) +
    row('Empresa', lead.company ?? undefined) +
    row('CNPJ', lead.cnpj ?? undefined) +
    row('Funcionários', lead.employeeCount ?? undefined) +
    row('Interesse', lead.interest ?? undefined) +
    row('Mensagem', lead.message ?? undefined) +
    `</table>` +
    (PUBLIC_URL ? `<br><a href="${PUBLIC_URL}" style="color:#1e9b46;font-weight:bold">Abrir o painel (Captação de leads)</a>` : '');
  await sendEmail(to, `Novo lead (${tipo}) — ${lead.name}`, wrapHtml('Novo lead captado 🎯', body));
}

export async function sendCertificateEmail(
  user: { name: string; email: string },
  courseName: string,
  certificateCode: string,
): Promise<void> {
  const link = PUBLIC_URL ? `${PUBLIC_URL}/?cert=${encodeURIComponent(certificateCode)}` : '';
  const vars = { nome: esc(user.name), curso: esc(courseName), codigo: esc(certificateCode), link };
  const tpl = await findTemplate(['certificad', 'aprovad', 'conclus']);
  const subject = tpl?.subject ? applyVars(tpl.subject, vars) : `Certificado emitido — ${courseName}`;
  const body = tpl?.body
    ? applyVars(tpl.body, vars).replace(/\n/g, '<br>')
    : `Parabéns, <strong>${esc(user.name)}</strong>!<br><br>Você concluiu e foi aprovado(a) no treinamento ` +
      `<strong>${esc(courseName)}</strong>. Seu certificado já está disponível.<br><br>` +
      `Código de validação: <strong>${esc(certificateCode)}</strong>` +
      (link ? `<br><br><a href="${link}" style="color:#1e9b46;font-weight:bold">Visualizar / validar o certificado</a>` : '');
  await sendEmail(user.email, subject, wrapHtml('Seu certificado foi emitido', body));
}
