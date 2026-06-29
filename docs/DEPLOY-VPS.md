# Deploy na VPS (Hostinger / Ubuntu 24.04 LTS)

Guia passo a passo para subir o **FalaInstrutor** numa VPS Ubuntu com
Node.js + PostgreSQL + Nginx (proxy reverso) + HTTPS (Let's Encrypt),
gerenciado pelo PM2.

> A aplicação roda em **um único processo Node** (`npm start`) que serve o
> front-end já buildado (`dist/`) e a API na porta **8787**. O Nginx fica na
> frente fazendo proxy reverso da porta 80/443 → 8787.

---

## 1. Pré-requisitos

- VPS Ubuntu 24.04 LTS já provisionada (Hostinger).
- Acesso SSH como `root` (chave já configurada no painel da Hostinger).
- (Opcional, mas recomendado) um **domínio** apontando para o IP da VPS
  (registro A em `@` e `www`). Sem domínio, o site abre só pelo IP, sem HTTPS.

---

## 2. Conectar na VPS

No seu computador, use a chave privada gerada (`falainstrutor_vps`):

```bash
chmod 600 falainstrutor_vps
ssh -i falainstrutor_vps root@SEU_IP
```

(troque `SEU_IP` pelo IP que a Hostinger mostra no painel da VPS.)

---

## 3. Baixar e configurar o script de setup

Já dentro da VPS:

```bash
# baixa só o script de setup do repositório
curl -fsSL https://raw.githubusercontent.com/adriano2/falainstrutor-unificado/main/deploy/setup-vps.sh -o setup-vps.sh
nano setup-vps.sh
```

Edite o bloco **CONFIGURE AQUI** no topo do arquivo:

| Variável          | O que colocar                                                        |
|-------------------|----------------------------------------------------------------------|
| `DOMAIN`          | seu domínio (ex.: `falainstrutor.com.br`). Deixe vazio p/ usar só IP |
| `DB_PASS`         | uma senha forte para o banco                                         |
| `ADMIN_PASSWORD`  | senha inicial do admin (troque após o 1º login)                      |
| `GEMINI_API_KEY`  | chave do Gemini (se usar IA) — opcional                              |
| `ASAAS_API_KEY`   | chave do Asaas (cobranças) — opcional                                |
| `RESEND_API_KEY`  | chave do Resend (e-mails) — opcional                                 |
| `EMAIL_FROM`      | remetente dos e-mails — opcional                                     |

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

---

## 4. Rodar o setup

```bash
bash setup-vps.sh
```

O script faz **tudo** automaticamente:

1. Atualiza o sistema.
2. Instala Node 20, PostgreSQL, Nginx, PM2.
3. Cria o banco e o usuário do PostgreSQL.
4. Clona o projeto em `/var/www/falainstrutor`.
5. Gera o `.env` (com `JWT_SECRET` aleatório).
6. `npm install` + `prisma generate` + `npm run build`.
7. Roda as migrações (`prisma migrate deploy`) e o seed.
8. Sobe a app com PM2 (reinício automático no boot).
9. Configura o Nginx como proxy reverso.
10. Libera o firewall (SSH + HTTP/HTTPS).
11. Se você informou `DOMAIN`, emite o certificado HTTPS (Let's Encrypt).

Ao final, acesse `https://SEU_DOMINIO` (ou `http://SEU_IP`).

---

## 5. Primeiro acesso

- Entre como **admin** com a senha definida em `ADMIN_PASSWORD`.
- Troque a senha do admin no painel.
- Confira Gestão de Cursos, instrutores e o certificado de teste.

---

## 6. Atualizar o projeto depois (redeploy)

Sempre que houver mudança no repositório (branch `main`), rode:

```bash
bash /var/www/falainstrutor/deploy/update.sh
```

Ele puxa o código, rebuilda, roda migrações e reinicia a app via PM2 —
sem downtime perceptível.

---

## 7. Comandos úteis

```bash
pm2 status                 # estado da aplicação
pm2 logs falainstrutor     # logs em tempo real
pm2 restart falainstrutor  # reiniciar
systemctl restart nginx    # reiniciar o Nginx
nginx -t                   # testar config do Nginx

# Banco
sudo -u postgres psql falainstrutor

# Backup do banco (gera arquivo .sql)
sudo -u postgres pg_dump falainstrutor > backup_$(date +%F).sql
```

---

## 8. HTTPS depois (se o domínio ainda não apontava na hora do setup)

Quando o DNS do domínio já estiver apontando para o IP da VPS:

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d SEU_DOMINIO --redirect
```

---

## 9. Variáveis de ambiente (`.env`)

Ficam em `/var/www/falainstrutor/.env` (permissão 600). Para editar:

```bash
nano /var/www/falainstrutor/.env
pm2 restart falainstrutor --update-env
```

Principais:

| Variável        | Descrição                                          |
|-----------------|----------------------------------------------------|
| `PORT`          | porta do Node (padrão 8787)                        |
| `DATABASE_URL`  | string de conexão do PostgreSQL                    |
| `JWT_SECRET`    | segredo dos tokens (gerado automaticamente)        |
| `ADMIN_PASSWORD`| senha inicial do admin                             |
| `GEMINI_API_KEY`| IA (opcional)                                      |
| `ASAAS_API_KEY` | cobranças (opcional)                               |
| `RESEND_API_KEY`| e-mails (opcional)                                 |

---

## 10. Solução de problemas

- **Site não abre:** `pm2 logs falainstrutor` (erro de app) e `nginx -t`.
- **Erro de banco:** confira `DATABASE_URL` no `.env` e se o PostgreSQL está
  ativo (`systemctl status postgresql`).
- **HTTPS falhou:** o domínio precisa estar apontando para o IP **antes** de
  rodar o certbot. Veja a seção 8.
- **Porta 8787 ocupada:** `pm2 delete falainstrutor` e rode o setup de novo.
