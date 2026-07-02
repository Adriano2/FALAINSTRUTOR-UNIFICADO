/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * FalaInstrutor — servidor de aplicação.
 *
 * Responsável por:
 *  - Autenticação real (JWT + bcrypt) em /api/auth
 *  - API de recursos (catálogo, matrículas, certificados...) em /api
 *  - Tutor de IA (Google Gemini) em /api/tutor — a chave fica só no servidor
 *  - Servir o build de produção (dist/) com fallback de SPA
 *
 * Segredos e conexões vêm de variáveis de ambiente (.env não versionado).
 */

import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { authRouter } from './auth';
import { apiRouter, createLeadFromInput } from './routes';
import { adminRouter } from './admin';
import { companyRouter } from './company';
import { instructorRouter } from './instructor';
import { paymentsRouter, paymentsConfigured } from './payments';
import { gamificationRouter } from './gamification';
import { emailConfigured } from './email';
import { whatsappConfigured } from './whatsapp';
import { prisma } from './db';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const PORT = Number(process.env.PORT) || 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

const app = express();

// Está atrás do Nginx: confia no primeiro proxy para obter o IP real do cliente
// (necessário para o rate limiting funcionar por IP e não pela ponta do proxy).
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Cabeçalhos de segurança (clickjacking, MIME sniffing, HSTS, referrer, etc.).
// CSP fica desligada para não quebrar o SPA/recursos externos (hardening futuro).
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

app.use(express.json({ limit: '3mb' }));

// --- Rate limiting (anti brute force / anti abuso de custo) ---
const rlMsg = { error: 'Muitas requisições. Aguarde alguns instantes e tente novamente.' };
// Backstop geral por IP em toda a API.
const apiLimiter = rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false, message: rlMsg });
// Login/cadastro: janela mais restrita contra força bruta / spam de conta.
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 30, standardHeaders: true, legacyHeaders: false, message: rlMsg });
// Endpoints de IA (Gemini) — evita estouro de custo/quota.
const aiLimiter = rateLimit({ windowMs: 60_000, max: 12, standardHeaders: true, legacyHeaders: false, message: rlMsg });
// Captação de leads pública — evita flood de banco + e-mail + WhatsApp.
const leadLimiter = rateLimit({ windowMs: 60 * 60_000, max: 20, standardHeaders: true, legacyHeaders: false, message: rlMsg });
// Checkout — evita criação em massa de cobranças no Asaas.
const checkoutLimiter = rateLimit({ windowMs: 15 * 60_000, max: 20, standardHeaders: true, legacyHeaders: false, message: rlMsg });

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/tutor', aiLimiter);
app.use('/api/sales-agent', aiLimiter);
app.use('/api/leads', leadLimiter);
app.use('/api/payments/checkout', checkoutLimiter);

// Health check enxuto (não expõe integrações/modelo — evita fingerprinting).
app.get('/api/health', async (_req: Request, res: Response) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  res.json({ ok: true, db: dbOk });
});

// Authentication + resource routes.
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/company', companyRouter);
app.use('/api/instructor', instructorRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api', apiRouter);

// --- Tutor de IA ---
app.post('/api/tutor', async (req: Request, res: Response) => {
  if (!ai) {
    return res.status(503).json({
      error:
        'O Tutor de IA ainda não foi configurado. Defina a variável de ambiente GEMINI_API_KEY no servidor para habilitá-lo.',
    });
  }

  try {
    const { courseName, modules, history } = req.body as {
      courseName?: string;
      modules?: string[];
      history?: ChatTurn[];
    };

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'Histórico de conversa inválido.' });
    }

    const moduleList =
      Array.isArray(modules) && modules.length > 0
        ? modules.map((m, i) => `${i + 1}. ${m}`).join('\n')
        : 'Conteúdo programático não informado.';

    const systemInstruction = [
      'Você é o "Tutor FalaInstrutor", um instrutor virtual especialista em',
      'Segurança e Saúde no Trabalho (SST) e Normas Regulamentadoras (NRs) do Brasil.',
      'Responda em português do Brasil, de forma didática, objetiva e cordial.',
      courseName ? `O aluno está cursando: "${courseName}".` : '',
      `Conteúdo programático do curso:\n${moduleList}`,
      'Baseie suas respostas nas normas brasileiras de SST. Se a pergunta fugir',
      'totalmente do tema de segurança do trabalho/curso, oriente gentilmente o',
      'aluno a focar no conteúdo. Nunca invente números de normas; quando não',
      'tiver certeza, recomende consultar o texto oficial da NR.',
    ]
      .filter(Boolean)
      .join('\n');

    const contents = history.map((turn) => ({
      role: turn.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(turn.text ?? '') }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { systemInstruction, temperature: 0.5, maxOutputTokens: 2048 },
    });

    const reply =
      response.text?.trim() ||
      'Não consegui gerar uma resposta agora. Pode reformular a sua dúvida?';

    res.json({ reply });
  } catch (err) {
    console.error('[tutor] Erro ao chamar o Gemini:', err);
    res.status(500).json({
      error: 'Ocorreu um erro ao consultar o Tutor de IA. Tente novamente em instantes.',
    });
  }
});

// --- Agente de IA de vendas (SDR) — capta e qualifica leads na landing ---
app.post('/api/sales-agent', async (req: Request, res: Response) => {
  if (!ai) {
    return res.status(503).json({
      error: 'O agente de IA ainda não foi configurado. Defina GEMINI_API_KEY no servidor.',
    });
  }
  try {
    const { history, courses } = req.body as { history?: ChatTurn[]; courses?: string[] };
    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'Histórico de conversa inválido.' });
    }

    const catalog = Array.isArray(courses) && courses.length > 0
      ? courses.slice(0, 60).map((c) => `- ${c}`).join('\n')
      : 'Treinamentos em Segurança e Saúde no Trabalho (NRs) e cursos técnicos.';

    const systemInstruction = [
      'Você é a "Júlia", consultora comercial (SDR) da FalaInstrutor — plataforma',
      'brasileira de treinamentos e homologação em Segurança e Saúde no Trabalho (SST/NRs).',
      'Seu objetivo é ACOLHER o visitante, entender a necessidade e CAPTAR o contato dele',
      'para a equipe dar sequência. Fale em português do Brasil, simpática, objetiva e consultiva.',
      'Identifique se é PESSOA (profissional/aluno) ou EMPRESA e direcione as perguntas.',
      'Tire dúvidas sobre os treinamentos, certificado válido, modalidade EaD/semipresencial.',
      'Conduza naturalmente para coletar: nome, e-mail e/ou telefone (WhatsApp) e o',
      'treinamento de interesse. Para empresa, pergunte também razão social e nº de funcionários.',
      'OBJETIVO DE VENDA: recomende o treinamento mais adequado do catálogo abaixo,',
      'destaque os benefícios (EaD com acesso imediato, certificado válido com QR de autenticidade,',
      'conteúdo conforme as NRs) e CONVIDE para finalizar a matrícula no site, clicando em',
      '"Ver treinamentos" para adicionar ao carrinho. Para empresas, ofereça turmas e orçamento.',
      'Seja consultiva e gere urgência leve (vagas/turmas), sem pressionar nem inventar promoções.',
      'NÃO invente preços nem números de normas; se não souber, diga que um especialista confirma.',
      'Catálogo de treinamentos disponíveis:',
      catalog,
      '',
      'IMPORTANTE — captura do lead: assim que tiver o NOME e ao menos um contato',
      '(e-mail OU telefone), inclua NO FINAL da sua resposta, em uma linha isolada, um bloco:',
      '[[LEAD]]{"type":"PERSON|COMPANY","name":"...","email":"...","phone":"...","company":"...","employeeCount":0,"interest":"..."}',
      'Use apenas os campos que você realmente coletou (omita os demais). NÃO mencione esse',
      'bloco ao usuário, não use crases nem markdown nele — é um marcador técnico que será removido.',
    ].filter(Boolean).join('\n');

    const contents = history.map((turn) => ({
      role: turn.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(turn.text ?? '') }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { systemInstruction, temperature: 0.6, maxOutputTokens: 1024 },
    });

    let reply = response.text?.trim() || 'Pode me contar um pouco mais sobre o que você procura?';

    // Extrai o marcador [[LEAD]]{...}, salva o lead e remove da resposta exibida.
    let leadCaptured = false;
    const match = reply.match(/\[\[LEAD\]\]\s*(\{[\s\S]*\})/);
    if (match) {
      reply = reply.replace(match[0], '').trim();
      try {
        const data = JSON.parse(match[1]) as Record<string, unknown>;
        const result = await createLeadFromInput({ ...data, source: 'ai-agent' });
        leadCaptured = !('error' in result);
      } catch (e) {
        console.error('[sales-agent] Falha ao salvar lead:', (e as Error).message);
      }
    }

    res.json({ reply, leadCaptured });
  } catch (err) {
    console.error('[sales-agent] Erro ao chamar o Gemini:', err);
    res.status(500).json({ error: 'Erro ao consultar o agente de IA. Tente novamente.' });
  }
});

// Serve the production build when it exists (single-server deployment).
if (fs.existsSync(DIST_DIR)) {
  // dotfiles: 'ignore' impede servir arquivos ocultos; index:false deixa o
  // fallback de SPA controlar a raiz.
  app.use(express.static(DIST_DIR, { dotfiles: 'ignore', index: false }));
  app.get(/^(?!\/api\/).*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Rotas de API não encontradas → JSON 404 (não cai no fallback do SPA).
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Recurso não encontrado.' });
});

// Handler global de erros: registra no servidor e devolve mensagem genérica
// (nunca vaza stack trace ao cliente, independentemente de NODE_ENV).
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[erro não tratado]', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`\n  FalaInstrutor API ouvindo em http://localhost:${PORT}`);
  console.log(`  Modelo Gemini: ${GEMINI_MODEL}`);
  console.log(
    ai
      ? '  Tutor de IA: HABILITADO (GEMINI_API_KEY detectada)\n'
      : '  Tutor de IA: DESABILITADO — defina GEMINI_API_KEY para ativar\n',
  );
});
