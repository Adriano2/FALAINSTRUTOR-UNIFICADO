# FalaInstrutor — Plataforma de Treinamento e Homologação SST

Plataforma completa de treinamento e homologação em Segurança e Saúde no
Trabalho (SST): catálogo de cursos, carrinho/checkout, sala de aula virtual,
exames com emissão de certificado, validação pública de certificados e um
painel administrativo robusto (usuários, matrículas, vendas, cupons,
comentários e configurações).

## Arquitetura (em evolução para produção)

O projeto está migrando de protótipo (dados no navegador) para uma plataforma
real, em fases:

- **Front-end** (React + Vite + Tailwind) — hoje ainda usa `localStorage`. A
  migração para a API acontece na Fase 2.
- **Backend** (Express + PostgreSQL + Prisma) — **Fase 1 concluída**:
  autenticação real com senha criptografada (bcrypt) e tokens JWT, API de
  catálogo/matrículas/certificados e o Tutor de IA (Gemini) com a chave
  protegida no servidor.

## Stack

- React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- lucide-react (ícones), jsPDF + html2canvas (certificado em PDF)
- Express + PostgreSQL + Prisma ORM
- bcryptjs + JWT (autenticação), zod (validação)
- @google/genai (Tutor de IA)

## Backend, banco de dados e autenticação (Fase 1)

**Pré-requisitos:** Node.js 18+ e um PostgreSQL acessível.

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `JWT_SECRET` e
   (opcional) `GEMINI_API_KEY`.
2. Crie as tabelas e popule os dados iniciais:
   ```bash
   npm run db:migrate   # aplica as migrações (cria as tabelas)
   npm run db:seed      # cursos, cupons, admin (senha via ADMIN_PASSWORD) e config
   ```
3. Suba o backend: `npm run dev:server` (porta `8787`).

Principais endpoints: `POST /api/auth/register`, `POST /api/auth/login`,
`GET /api/auth/me`, `GET /api/courses`, `GET /api/enrollments/me`,
`GET /api/certificates/:code`, `POST /api/tutor`, `GET /api/health`.

## Deploy (Render / Railway / Docker)

- **Render:** o arquivo `render.yaml` provisiona o Web Service + um PostgreSQL
  gerenciado. Em New > Blueprint, selecione o repositório e defina
  `GEMINI_API_KEY` e `ADMIN_PASSWORD` no painel. Migrações e seed rodam
  automaticamente no `preDeployCommand`.
- **Railway / Cloud Run / VPS:** use o `Dockerfile` incluso (aplica migrações e
  inicia o servidor). Configure as variáveis de ambiente do `.env.example`.

## Rodando localmente

**Pré-requisitos:** Node.js 18+

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

> Sem configurar a chave, todo o app funciona normalmente; apenas o Tutor de
> IA exibe uma mensagem informando que ainda não foi habilitado.

### Habilitando o Tutor de IA (Gemini)

A chave do Gemini fica **somente no servidor** e nunca é enviada ao navegador.

1. Copie `.env.example` para `.env` e preencha `GEMINI_API_KEY`
   (obtida em https://aistudio.google.com/apikey).
2. Em um terminal, suba o backend: `npm run dev:server` (porta `8787`).
3. Em outro terminal, suba o front-end: `npm run dev` (porta `3000`).

O Vite faz proxy de `/api/*` para o backend automaticamente. Abra um curso no
"Painel do Aluno" → "Acessar Aulas" para usar o Tutor de IA na sala virtual.

### Produção (servidor único)

```bash
npm run build   # gera o dist/
npm start       # Express serve o dist/ e a API na porta 8787
```

## Scripts

- `npm run dev` — front-end (Vite) em modo desenvolvimento
- `npm run dev:server` — backend (API + Tutor de IA) com hot-reload
- `npm run build` — build de produção (saída em `dist/`)
- `npm start` — sobe o backend servindo o build + a API
- `npm run preview` — pré-visualiza o build de produção (sem API)
- `npm run lint` — checagem de tipos do front-end e do servidor
- `npm run db:migrate` / `db:deploy` — migrações (dev / produção)
- `npm run db:seed` — popula dados iniciais
- `npm run db:studio` — abre o Prisma Studio (inspeção do banco)

## Acesso de teste

Na tela de **Login** há atalhos de avaliação rápida ("Administrador" e
"Aluno") que entram diretamente nos respectivos painéis, sem necessidade de
senha.

Também é possível entrar pela conta administradora semente:

- **E-mail:** `adriano.ricardo01@gmail.com`
- **Senha:** `Anthony9936#`

Contas de aluno semente (Jéssica, Thiago, etc.) não possuem senha definida e
podem ser acessadas apenas pelos atalhos de avaliação. Novas contas criadas
pelo cadastro exigem e-mail e senha (mínimo de 6 caracteres).

## Validação de certificados

Use a tela "Validar Certificado" com um dos códigos semente, por exemplo
`CERT-35-JESSICA-01A` ou `CERT-35-THIAGO-02B`.
