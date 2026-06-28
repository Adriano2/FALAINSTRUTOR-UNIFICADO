/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Autenticação real: cadastro e login com senha criptografada (bcrypt) e
 * emissão de tokens JWT. Inclui middlewares para proteger rotas e exigir
 * papéis (admin/aluno).
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { Role } from '@prisma/client';
import { prisma } from './db';
import { sendWelcomeEmail } from './email';
import { evaluateUserAccess } from './accessSchedule';

const JWT_SECRET = process.env.JWT_SECRET || 'insecure-dev-secret';
const JWT_EXPIRES_IN = '7d';

export interface AuthPayload {
  sub: string;
  role: Role;
}

// Express request augmented with the authenticated user payload.
export interface AuthedRequest extends Request {
  user?: AuthPayload;
}

const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto.'),
  email: z.string().email('E-mail inválido.'),
  cpf: z.string().min(11, 'CPF inválido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  dob: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Informe a senha.'),
});

function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Remove sensitive fields before returning a user to the client.
function publicUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }
  const { name, email, cpf, password, dob } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: cleanEmail }, { cpf }] },
    select: { id: true },
  });
  if (exists) {
    return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: cleanEmail, cpf, passwordHash, dob, role: 'STUDENT' },
  });

  const token = signToken({ sub: user.id, role: user.role });
  // E-mail de boas-vindas (fire-and-forget — não bloqueia o cadastro).
  void sendWelcomeEmail({ name: user.name, email: user.email });
  res.status(201).json({ token, user: publicUser(user) });
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }
  const { email, password } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user || !user.isActive) {
    // Avoid leaking whether the account exists.
    return res.status(401).json({ error: 'Credenciais inválidas ou conta inativa.' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Credenciais inválidas ou conta inativa.' });
  }

  // Restrição de horário definida pela empresa: bloqueia o login do aluno fora
  // da janela permitida (gestor/admin/instrutor não são afetados).
  const access = await evaluateUserAccess(user.id);
  if (!access.allowed) {
    return res.status(403).json({ error: `Acesso bloqueado pela sua empresa neste horário. ${access.message ?? ''}`.trim() });
  }

  // Auditoria: registra a hora de início deste login (não bloqueia o login se falhar).
  prisma.loginSession
    .create({ data: { userId: user.id, userAgent: req.get('user-agent')?.slice(0, 255) ?? null } })
    .catch(() => {});

  const token = signToken({ sub: user.id, role: user.role });
  res.json({ token, user: publicUser(user) });
});

// Returns the currently authenticated user (validates the token).
authRouter.get('/me', authenticate, async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user: publicUser(user) });
});

// --- Middlewares ---

export function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
    req.user = { sub: decoded.sub, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    next();
  };
}
