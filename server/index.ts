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
import express, { type Request, type Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { authRouter } from './auth';
import { apiRouter } from './routes';
import { adminRouter } from './admin';
import { companyRouter } from './company';
import { paymentsRouter, paymentsConfigured } from './payments';
import { emailConfigured } from './email';
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
app.use(express.json({ limit: '1mb' }));

// Health check / configuration status (does NOT leak secrets).
app.get('/api/health', async (_req: Request, res: Response) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  res.json({ ok: true, db: dbOk, aiConfigured: Boolean(ai), model: GEMINI_MODEL, paymentsConfigured, emailConfigured: emailConfigured() });
});

// Authentication + resource routes.
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/company', companyRouter);
app.use('/api/payments', paymentsRouter);
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

// Serve the production build when it exists (single-server deployment).
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api\/).*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n  FalaInstrutor API ouvindo em http://localhost:${PORT}`);
  console.log(`  Modelo Gemini: ${GEMINI_MODEL}`);
  console.log(
    ai
      ? '  Tutor de IA: HABILITADO (GEMINI_API_KEY detectada)\n'
      : '  Tutor de IA: DESABILITADO — defina GEMINI_API_KEY para ativar\n',
  );
});
