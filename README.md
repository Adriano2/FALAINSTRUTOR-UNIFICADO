# FalaInstrutor — Plataforma de Treinamento e Homologação SST

Plataforma completa de treinamento e homologação em Segurança e Saúde no
Trabalho (SST): catálogo de cursos, carrinho/checkout, sala de aula virtual,
exames com emissão de certificado, validação pública de certificados e um
painel administrativo robusto (usuários, matrículas, vendas, cupons,
comentários e configurações).

O front-end (React + Vite + TypeScript + Tailwind CSS) persiste todo o estado
no `localStorage` do navegador. Há também um **backend Express opcional** que
fornece o **Tutor de IA** (Google Gemini) — ele existe apenas para manter a
chave de API protegida no servidor.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- lucide-react (ícones)
- jsPDF + html2canvas (geração do certificado em PDF)
- Express + @google/genai (backend do Tutor de IA)

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
- `npm run dev:server` — backend do Tutor de IA com hot-reload
- `npm run build` — build de produção (saída em `dist/`)
- `npm start` — sobe o backend servindo o build + a API
- `npm run preview` — pré-visualiza o build de produção (sem API)
- `npm run lint` — checagem de tipos do front-end e do servidor

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
