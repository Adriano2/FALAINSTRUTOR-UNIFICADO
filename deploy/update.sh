#!/usr/bin/env bash
# =============================================================================
# FalaInstrutor — Atualização do VPS (redeploy)
# Puxa o código mais recente, rebuilda, roda migrações e reinicia a aplicação.
#
# Como usar (como root no VPS):
#   bash /var/www/falainstrutor/deploy/update.sh
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/falainstrutor}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

echo "==> Atualizando código (origin/$BRANCH)"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> Instalando dependências"
npm install

echo "==> Gerando Prisma client + build"
npx prisma generate
npm run build

echo "==> Migrações do banco"
npx prisma migrate deploy
npx prisma db seed || echo "seed falhou (seguindo)"

echo "==> Reiniciando aplicação (PM2)"
pm2 restart falainstrutor --update-env
pm2 save

echo ""
echo "============================================================"
echo " ✅ Atualização concluída!"
echo "    Logs: pm2 logs falainstrutor"
echo "============================================================"
