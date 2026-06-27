# Banco de dados grátis e permanente — Neon (PostgreSQL)

O plano gratuito de PostgreSQL do **Render** expira em ~30 dias e, quando isso
acontece, o deploy falha (não conecta ao banco). A **Neon** (neon.tech) oferece
PostgreSQL gratuito que **não expira** — os dados ficam salvos; o banco apenas
"hiberna" e acorda sozinho na primeira conexão.

Este guia troca o banco do projeto para a Neon **sem mudar código** (é só apontar
a variável `DATABASE_URL` para a Neon).

---

## 1) Criar o banco na Neon (grátis)

1. Acesse **https://neon.tech** e crie uma conta (pode entrar com o Google).
2. Clique em **New Project**.
3. Dê um nome (ex.: `falainstrutor`), escolha a região mais próxima
   (ex.: *AWS São Paulo* ou *US East*) e clique em **Create project**.
4. A Neon mostra a **Connection string**. Copie a opção que aparece como
   **"Connection string"** (formato abaixo). Marque a caixa **"Show password"**
   para vir completa:

   ```
   postgresql://USUARIO:SENHA@ep-xxxx-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```

   > Dica: se a Neon mostrar "Pooled" e "Direct", copie a **Direct connection**
   > (sem `-pooler`). Ela funciona tanto para as migrações quanto para o site.

---

## 2) Apontar o projeto para a Neon (no Render)

1. Abra **https://dashboard.render.com** → serviço **`falainstrutor`**.
2. Menu **Environment** (variáveis de ambiente).
3. Encontre **`DATABASE_URL`**:
   - Se estiver **linkada ao banco do Render** (aparece "From Database"),
     clique para **desvincular/editar** e transforme em valor manual.
   - Cole a **Connection string da Neon** (do passo 1) como valor.
4. **Save Changes**.
5. Faça um **Manual Deploy → Clear build cache & deploy**.

No start, o projeto roda automaticamente `prisma migrate deploy` (cria todas as
tabelas na Neon) e `prisma db seed` (popula dados iniciais: admin, cursos, etc.).

---

## 3) Conferir

- O deploy deve ficar **Live** (verde).
- Acesse o site e faça login no admin para confirmar que os dados aparecem.
- A partir daí o banco **não expira mais**.

---

## Observações

- **Migrações/Seed:** já acontecem sozinhos no boot (ver `render.yaml`,
  `startCommand`). Não precisa rodar nada manualmente.
- **Senha inicial do admin:** definida pela variável `ADMIN_PASSWORD` (Environment).
- **Backup:** o código fica no GitHub; para um dump do banco Neon, dá para usar
  `pg_dump "<DATABASE_URL>"` quando quiser.
- **Limite grátis Neon:** ~0,5 GB de armazenamento — folgado para este sistema.
