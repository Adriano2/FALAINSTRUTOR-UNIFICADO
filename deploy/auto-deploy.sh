#!/usr/bin/env bash
# =============================================================================
# FalaInstrutor — Auto-deploy
# Verifica se há commit novo no branch e, SOMENTE se houver, roda o redeploy.
# Pensado para rodar via cron (a cada poucos minutos). Se nada mudou, sai rápido.
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/falainstrutor}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

# Busca o estado remoto sem alterar a árvore local.
git fetch origin "$BRANCH" --quiet

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/${BRANCH}")"

if [ "$LOCAL" = "$REMOTE" ]; then
  # Nada novo — encerra silenciosamente.
  exit 0
fi

echo "==================================================================="
echo "$(date '+%Y-%m-%d %H:%M:%S') — nova versão detectada"
echo "  local : $LOCAL"
echo "  remoto: $REMOTE"
echo "Iniciando redeploy..."

# Reaproveita o script de atualização (pull + build + migrate + seed + restart).
# Mantém o modo produção (sem contas de demonstração).
SEED_DEMO="${SEED_DEMO:-false}" bash "$APP_DIR/deploy/update.sh"

echo "$(date '+%Y-%m-%d %H:%M:%S') — redeploy concluído."
