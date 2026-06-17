# FalaInstrutor — Plataforma de Treinamento e Homologação SST

Plataforma completa de treinamento e homologação em Segurança e Saúde no
Trabalho (SST): catálogo de cursos, carrinho/checkout, sala de aula virtual,
exames com emissão de certificado, validação pública de certificados e um
painel administrativo robusto (usuários, matrículas, vendas, cupons,
comentários e configurações).

A aplicação é **100% front-end** (React + Vite + TypeScript + Tailwind CSS).
Todo o estado é persistido no `localStorage` do navegador — não há back-end nem
chaves de API necessárias para rodar.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- lucide-react (ícones)
- jsPDF + html2canvas (geração do certificado em PDF)

## Rodando localmente

**Pré-requisitos:** Node.js 18+

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (saída em `dist/`)
- `npm run preview` — pré-visualiza o build de produção
- `npm run lint` — checagem de tipos (`tsc --noEmit`)

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
