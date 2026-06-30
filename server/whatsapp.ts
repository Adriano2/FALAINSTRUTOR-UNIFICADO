/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Notificação por WhatsApp via API oficial (WhatsApp Cloud API / Meta).
 *
 * Configuração por variáveis de ambiente (NUNCA no repositório):
 *   - WHATSAPP_TOKEN        → token de acesso permanente do app do WhatsApp
 *   - WHATSAPP_PHONE_ID     → ID do número de telefone (phone_number_id)
 *   - LEADS_NOTIFY_WHATSAPP → número(s) que recebem o aviso (E.164, ex.: 5511999999999);
 *                             separe por vírgula para vários
 *   - WHATSAPP_API_VERSION  → opcional (padrão: v21.0)
 *   - WHATSAPP_TEMPLATE     → opcional: nome de um template aprovado (com 1 variável
 *                             no corpo). Necessário fora da janela de 24h de atendimento.
 *   - WHATSAPP_TEMPLATE_LANG→ opcional: idioma do template (padrão: pt_BR)
 *
 * Degrada graciosamente: sem configuração, apenas registra no log. Nunca lança
 * — o envio é "fire-and-forget" e jamais bloqueia a captação do lead.
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.LEADS_NOTIFY_WHATSAPP);
}

function recipients(): string[] {
  return (process.env.LEADS_NOTIFY_WHATSAPP || '')
    .split(',')
    .map((n) => n.replace(/\D/g, ''))
    .filter((n) => n.length >= 10);
}

async function sendToNumber(to: string, message: string): Promise<boolean> {
  const url = `https://graph.facebook.com/${API_VERSION}/${process.env.WHATSAPP_PHONE_ID}/messages`;
  const template = process.env.WHATSAPP_TEMPLATE;
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || 'pt_BR';

  // Com template aprovado (recomendado p/ mensagens fora da janela de 24h):
  // usa 1 variável no corpo com o resumo do lead. Sem template: mensagem de texto.
  const body = template
    ? {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: { name: template, language: { code: lang }, components: [{ type: 'body', parameters: [{ type: 'text', text: message }] }] },
      }
    : { messaging_product: 'whatsapp', to, type: 'text', text: { preview_url: false, body: message } };

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      console.warn(`[whatsapp] falha ao enviar (${resp.status}) para ${to}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[whatsapp] erro de rede ao enviar:', err);
    return false;
  }
}

// Notifica a equipe comercial sobre um novo lead captado.
export async function sendLeadWhatsApp(lead: {
  type: string; name: string; email?: string | null; phone?: string | null;
  company?: string | null; employeeCount?: number | null; interest?: string | null; source: string;
}): Promise<void> {
  if (!whatsappConfigured()) {
    console.log(`[whatsapp] (não configurado) novo lead: ${lead.name}`);
    return;
  }
  const tipo = lead.type === 'COMPANY' ? 'Empresa' : 'Profissional';
  const origem = lead.source === 'ai-agent' ? 'Agente IA' : 'Landing';
  const linhas = [
    `🎯 Novo lead (${tipo}) — ${origem}`,
    `Nome: ${lead.name}`,
    lead.company ? `Empresa: ${lead.company}` : '',
    lead.phone ? `Tel: ${lead.phone}` : '',
    lead.email ? `E-mail: ${lead.email}` : '',
    typeof lead.employeeCount === 'number' ? `Funcionários: ${lead.employeeCount}` : '',
    lead.interest ? `Interesse: ${lead.interest}` : '',
  ].filter(Boolean);
  const message = linhas.join('\n');
  await Promise.all(recipients().map((to) => sendToNumber(to, message)));
}

// Envia uma mensagem livre aos números responsáveis (LEADS_NOTIFY_WHATSAPP).
// Usado, por ex., para o resumo de certificados a vencer.
export async function sendWhatsAppToResponsibles(message: string): Promise<boolean> {
  if (!whatsappConfigured()) {
    console.log('[whatsapp] (não configurado) mensagem não enviada:', message.slice(0, 80));
    return false;
  }
  const results = await Promise.all(recipients().map((to) => sendToNumber(to, message)));
  return results.some(Boolean);
}
