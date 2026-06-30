# TODO — Implementações futuras (FalaInstrutor)

Lista de itens combinados para evolução posterior da plataforma.

> ## 🔒 REGRA FIXA — LAYOUT DO CERTIFICADO CONGELADO
> **NÃO alterar o layout do certificado (frente e verso)** sem pedido explícito do cliente.
> O modelo atual (frente + verso, com a faixa holográfica centralizada no verso)
> foi aprovado. A cada modificação no projeto, **lembrar o cliente desta regra**.
> Arquivos do certificado: `src/components/StudentDashboard.tsx` (front `certificate-page-1`,
> verso `BackPage`). Mexer apenas quando o cliente autorizar.

## 💳 LEMBRETE — Finalizar pagamento Asaas (PENDENTE)

**Status:** integração pronta no código; falta concluir a configuração na conta Asaas.
Itens a fazer (produção, app.asaas.com):
1. Colar a **API Key correta** (`$aact_...`, longa) no painel do site
   (Configurações → Pagamento – Integração Asaas), Ambiente = **Produção**.
   (A chave anterior era curta/errada — deu 401 em prod e sandbox.)
2. **DESABILITAR** "Validação de saque via Webhook" (Integrações → Segurança) —
   estava habilitada e pode **travar os saques** (nosso app não autoriza saque).
3. Criar **Webhook de Cobranças**: URL `https://falainstrutor.com.br/api/payments/webhook`,
   token = "Token do Webhook" do painel, eventos PAYMENT_CONFIRMED + PAYMENT_RECEIVED.
4. Conferir: `curl -s http://localhost:8787/api/payments/status` → `configured:true`
   e teste do token contra o Asaas → `producao: 200`.
5. Compra-teste de **R$ 1,00** via PIX → confirmar matrícula automática.

## 🏛️ eSocial S-2245 — Fase 2 (transmissão direta) e validação do leiaute

**Status (Fase 1 — FEITO):** captura de `codTreina`/flag eSocial por curso
(Gestão de Cursos), CPF/registro do responsável no instrutor, de-para
NR→codTreina (`server/esocial.ts`), e **exportação no painel da empresa**
(`/company/esocial/s2245`): tabela com pendências + download **CSV** e **XML
rascunho** (um evento por trabalhador). Quem transmite é o empregador.

**Pendências/Fase 2:**
1. **Validar o XML contra o XSD vigente** do eSocial (namespace/versão/tags do
   grupo `treiCap`/`responsavel`) antes de qualquer transmissão — o XML atual é
   RASCUNHO. Conferir também a **simplificação do SST**: o S-2245 pode ser
   excluído e migrar p/ **S-2200/S-2206** (Tabela 29 → 28). O motor de dados em
   `server/esocial.ts` já está desacoplado do leiaute.
2. Conferir o **de-para `DEFAULT_CODTREINA`** com a tabela oficial vigente.
3. **Transmissão direta** (opcional): cliente SOAP dos webservices (envio de
   lote → consulta), assinatura **XMLDSig** com o e-CNPJ do empregador
   (procuração eletrônica) — reaproveitar `server/icp.ts`. Homologar em
   **Produção Restrita** antes de produção.

## 🧾 Integração de emissão de NFS-e (Nota Fiscal de Serviço)

**Status:** base de gerenciamento já implementada (cadastro manual, status
Pendente/Emitida/Cancelada). Falta a **emissão automática** junto à
prefeitura/SEFAZ, para tomadores **CPF (PF)** e **CNPJ (PJ)**.

**Provedores candidatos:** NFE.io, PlugNotas ou Focus NFe.

**Onde ligar quando for implementar:**
- Backend: `server/admin.ts` — rotas `/admin/invoices`. Criar um serviço
  `server/nfse.ts` que chama a API do provedor escolhido e, ao "Emitir",
  preenche `number`/`series` e muda o `status` para `ISSUED`
  (`ServiceInvoice` em `prisma/schema.prisma`).
- Front: `src/components/admin/InvoiceManager.tsx` — trocar a mudança manual
  de status por um botão "Emitir" que chama a emissão real; tratar retorno
  (PDF/XML, link da nota) e erros.
- Config/segredos: adicionar token/credenciais do provedor como variáveis de
  ambiente no Render (`NFSE_PROVIDER`, `NFSE_API_KEY`, etc.) — **nunca**
  commitar no repositório. Opcional: campo de configuração no painel admin.
- Dados do emitente (CNPJ, inscrição municipal, regime tributário, código de
  serviço/CNAE) precisam ser cadastrados — avaliar reaproveitar o `PaymentConfig`
  ou criar uma seção própria.

**Lembrete:** confirmar com o cliente o município de emissão e o provedor antes
de iniciar (cada prefeitura tem particularidades de layout/credenciamento).

## 📝 Versionar provas (gabarito junto da submissão)

**Status:** o Editor de Provas já permite criar/editar questões por curso
(`Course.examQuestions`). Porém as respostas do aluno são gravadas por
**posição da alternativa** (`ExamSubmission.answers` = índice). Se a prova for
editada/reordenada depois que alunos já fizeram, as submissões antigas podem
não corresponder às novas posições.

**Solução futura:** guardar um "snapshot" da prova (enunciados, alternativas e
gabarito) junto de cada `ExamSubmission` no momento do envio — assim a Auditoria
de Provas sempre mostra a prova exatamente como o aluno respondeu, independente
de edições posteriores.

**Onde ligar:**
- `prisma/schema.prisma` — adicionar `questionsSnapshot Json?` em `ExamSubmission`.
- `server/routes.ts` — rota `POST /enrollments/:id/exam`: salvar o snapshot das
  questões usadas (vir do front ou recomputar a partir do curso no momento).
- `src/components/AdminDashboard.tsx` — Auditoria de Provas: usar o snapshot da
  submissão quando existir, em vez das questões atuais do curso.

**Mitigação atual:** finalizar a prova no Editor antes de aplicá-la aos alunos.

## 🌐 Integração do site unificado / CMS de páginas (futuro)

**Status:** combinado para mais adiante (o projeto ainda será ajustado).

**Recomendação:** implementar um **CMS de páginas** no painel admin — tornar as
páginas institucionais editáveis e navegáveis, sem depender de código.

**Escopo sugerido:**
- Renderizar as páginas cadastradas em "Gestão de páginas" como **rotas reais**
  (ex.: `/p/{slug}`), com links no rodapé/menu.
- Editor no admin com título, slug, conteúdo (com formatação) e publicar/ocultar.
- Editar blocos da home (hero, seções) pelo admin.

**Onde ligar:**
- `src/components/admin/ContentManager.tsx` (módulo "pages" já existe — guarda
  title/slug/content).
- `src/App.tsx` — adicionar rota para `/p/:slug` lendo de `contentApi.get('pages')`.
- Novo componente `src/components/PageView.tsx` para renderizar a página.

**Alternativas (se mudar o objetivo):** importar um site externo já existente
(WordPress/HTML) para dentro; ou login único/SSO com outro sistema (mais
sensível — combinar com a etapa final).
