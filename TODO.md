# TODO — Implementações futuras (FalaInstrutor)

Lista de itens combinados para evolução posterior da plataforma.

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
