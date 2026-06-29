#!/usr/bin/env bash
# =============================================================================
# FalaInstrutor — Setup inicial do VPS (Ubuntu 24.04 LTS)
# Instala Node, PostgreSQL, Nginx, PM2; clona o projeto; cria o banco; builda;
# roda migrações + seed; sobe a aplicação com PM2; configura Nginx + HTTPS.
#
# Como usar (como root no VPS):
#   1) Edite as variáveis abaixo (DOMAIN, DB_PASS, ADMIN_PASSWORD, etc).
#   2) bash setup-vps.sh
# =============================================================================
set -euo pipefail

# ----------------------- CONFIGURE AQUI --------------------------------------
REPO_URL="https://github.com/adriano2/falainstrutor-unificado.git"
BRANCH="main"
APP_DIR="/var/www/falainstrutor"
APP_PORT="8787"

DOMAIN=""                      # ex.: "falainstrutor.com.br" (deixe vazio p/ usar só IP por enquanto)
DB_NAME="falainstrutor"
DB_USER="falainstrutor"
DB_PASS="TROQUE_ESTA_SENHA"    # senha do banco (forte)

# Variáveis da aplicação (preencha as que usar; o resto pode ficar vazio)
ADMIN_PASSWORD="TROQUE_ADMIN"  # senha inicial do admin (seed)
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
ASAAS_API_KEY=""
ASAAS_ENV="sandbox"
RESEND_API_KEY=""
EMAIL_FROM=""
# -----------------------------------------------------------------------------

echo "==> Atualizando o sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get upgrade -y

echo "==> Instalando dependências base (git, nginx, postgres, build tools)"
apt-get install -y curl git nginx postgresql postgresql-contrib ufw ca-certificates gnupg

echo "==> Instalando Node.js 20 (NodeSource)"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v && npm -v

echo "==> Instalando PM2 (gerenciador de processos)"
npm install -g pm2

echo "==> Criando banco de dados PostgreSQL"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

echo "==> Clonando o projeto"
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin "$BRANCH" && git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> Criando arquivo .env"
JWT_SECRET="$(openssl rand -hex 32)"
ASAAS_WEBHOOK_TOKEN="$(openssl rand -hex 16)"
cat > "$APP_DIR/.env" <<ENV
NODE_ENV=production
PORT=${APP_PORT}
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public
JWT_SECRET=${JWT_SECRET}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
GEMINI_API_KEY=${GEMINI_API_KEY}
GEMINI_MODEL=${GEMINI_MODEL}
ASAAS_API_KEY=${ASAAS_API_KEY}
ASAAS_ENV=${ASAAS_ENV}
ASAAS_WEBHOOK_TOKEN=${ASAAS_WEBHOOK_TOKEN}
RESEND_API_KEY=${RESEND_API_KEY}
EMAIL_FROM=${EMAIL_FROM}
ENV
chmod 600 "$APP_DIR/.env"

echo "==> Instalando dependências e buildando"
npm install
npx prisma generate
npm run build

echo "==> Migrações + seed do banco"
npx prisma migrate deploy
npx prisma db seed || echo "seed falhou (seguindo)"

echo "==> Subindo a aplicação com PM2"
pm2 delete falainstrutor 2>/dev/null || true
pm2 start npm --name falainstrutor -- start
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo "==> Configurando Nginx (proxy reverso -> :${APP_PORT})"
SERVER_NAME="${DOMAIN:-_}"
cat > /etc/nginx/sites-available/falainstrutor <<NGINX
server {
    listen 80;
    server_name ${SERVER_NAME};
    client_max_body_size 12M;
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/falainstrutor /etc/nginx/sites-enabled/falainstrutor
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "==> Firewall (libera SSH e HTTP/HTTPS)"
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
yes | ufw enable || true

if [ -n "$DOMAIN" ]; then
  echo "==> HTTPS (Let's Encrypt) para ${DOMAIN}"
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "admin@${DOMAIN}" --redirect || \
    echo "Certbot falhou — verifique se o domínio já aponta para o IP do VPS e rode 'certbot --nginx -d ${DOMAIN}' depois."
fi

echo ""
echo "============================================================"
echo " ✅ Deploy concluído!"
echo "    App (PM2): pm2 status / pm2 logs falainstrutor"
[ -n "$DOMAIN" ] && echo "    Acesse: https://${DOMAIN}" || echo "    Acesse: http://SEU_IP"
echo "    .env em: ${APP_DIR}/.env (troque ADMIN_PASSWORD após o 1º login)"
echo "============================================================"
