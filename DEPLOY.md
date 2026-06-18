# Deploy no Render — FalaInstrutor

Guia passo a passo para publicar a plataforma (Web Service Node + PostgreSQL
gerenciado) usando o `render.yaml` deste repositório.

## Pré-requisitos
- Conta no GitHub com este repositório (`Adriano2/FALAINSTRUTOR-UNIFICADO`).
- Conta no Render: https://render.com (pode entrar com o GitHub).
- Chave de API do **Asaas Sandbox** (https://sandbox.asaas.com → Integrações → API Key).
- (Opcional) Chave do **Google Gemini** para o Tutor de IA.

---

## Passo 0 — Levar todo o código para a branch de deploy
O Render lê o `render.yaml` da branch escolhida. Garanta que ela contém tudo:

- **Opção A (recomendada):** mescle o Pull Request na `main`
  (no GitHub, botão **"Merge pull request"**). Depois o Render usa a `main`.
- **Opção B:** ao criar o Blueprint, selecione a branch
  `claude/festive-brahmagupta-zxkdk0` diretamente.

## Passo 1 — Criar o Blueprint
1. No Render: **New +** → **Blueprint**.
2. Conecte o GitHub e selecione o repositório.
3. Escolha a branch (`main` após o merge, ou a branch de trabalho).
4. O Render lê o `render.yaml` e mostra: **1 Web Service** + **1 PostgreSQL**.
5. Clique em **Apply**.

## Passo 2 — Variáveis de ambiente
No serviço web → aba **Environment**, preencha as marcadas como "sync:false":

| Variável | Valor |
|---|---|
| `ASAAS_API_KEY` | sua chave do **Sandbox** Asaas (`$aact_...`) |
| `ASAAS_ENV` | `sandbox` (já vem preenchida) |
| `GEMINI_API_KEY` | sua chave Gemini (opcional; sem ela o Tutor fica desabilitado) |
| `ADMIN_PASSWORD` | a senha que o admin usará para entrar |

Preenchidas **automaticamente** (não precisa mexer):
- `DATABASE_URL` (do PostgreSQL criado), `JWT_SECRET`, `ASAAS_WEBHOOK_TOKEN`
  (gerados), `GEMINI_MODEL`, `RENDER_EXTERNAL_URL` (URL pública).

> Já criou o token de webhook no Asaas? Então **substitua** o valor gerado de
> `ASAAS_WEBHOOK_TOKEN` pelo mesmo token configurado no Asaas (devem ser iguais).

## Passo 3 — Deploy
- O Render roda: build → `prisma migrate deploy` → `prisma db seed` → inicia o servidor.
- Acompanhe em **Logs**. Quando aparecer "FalaInstrutor API ouvindo...", está no ar.
- Sua URL: algo como `https://falainstrutor.onrender.com`.

## Passo 4 — Primeiro acesso
- Abra a URL. Faça login como admin:
  - **E-mail:** `adriano.ricardo01@gmail.com`
  - **Senha:** o valor de `ADMIN_PASSWORD`.
- O catálogo (NRs), cadastro de aluno, sala de aula e Tutor de IA já funcionam.

## Passo 5 — Webhook do Asaas (confirmação automática do pagamento)
No painel do Asaas (sandbox) → **Integrações → Webhooks → Adicionar**:
- **URL:** `https://SEU-APP.onrender.com/api/payments/webhook`
- **Token de autenticação:** o mesmo valor de `ASAAS_WEBHOOK_TOKEN` (copie do Render).
- **Eventos:** *Pagamento confirmado* e *Pagamento recebido*.

## Passo 6 — Testar o pagamento (sandbox)
1. No site, escolha um curso → **Comprar** → **Finalizar Matrícula**.
2. Você é levado à página de pagamento do Asaas.
3. Pague com um **cartão de teste** do sandbox Asaas (ou PIX simulado).
4. O webhook confirma → a matrícula aparece no painel do aluno e o certificado
   fica disponível ao concluir o curso.

---

## Indo para produção
1. Crie/abra a conta **real** do Asaas; gere a API Key de produção.
2. No Render: `ASAAS_API_KEY` = chave de produção e `ASAAS_ENV` = `production`.
3. **Rotacione** segredos expostos (`ASAAS_WEBHOOK_TOKEN`, `GEMINI_API_KEY`).
4. Configure o **repasse/saque** no Asaas para sua conta (ex.: PIX Nubank PJ).
5. (Opcional) Domínio próprio em **Settings → Custom Domains**.

## Solução de problemas
- **App não sobe / erro de tabela:** confira os Logs; o start roda
  `prisma migrate deploy` automaticamente. Verifique se `DATABASE_URL` está
  ligada ao banco do Blueprint.
- **Erro de SSL no banco:** acrescente `?sslmode=require` ao final do
  `DATABASE_URL` (conexão externa).
- **Primeiro acesso lento:** no plano gratuito o serviço "dorme" após
  inatividade; a primeira requisição pode levar ~50s (cold start).
- **Postgres gratuito expira em ~90 dias:** para uso contínuo, use um plano pago.
- **Tutor de IA desabilitado:** defina `GEMINI_API_KEY`.
- **Pagamento "não configurado":** defina `ASAAS_API_KEY` e faça novo deploy.
