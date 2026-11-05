#!/usr/bin/env bash
# =============================================================
# CVPro225 — déploiement / mise à jour (sur le serveur, user deploy)
#
#   infra/server/deploy.sh               pull + build + bascule + vérif
#   infra/server/deploy.sh --migrate     idem, applique les nouvelles migrations
#                                        (affiche la commande + confirmation)
#   infra/server/deploy.sh --force       redéploie même si le commit est inchangé
#   infra/server/deploy.sh rollback      revient à l'image précédente
#   infra/server/deploy.sh status        état courant
#
# Chaque image est taguée avec le commit (cvpro225-app:<sha>). L'état est
# conservé dans .deploy/{current,previous}. Un échec de santé après bascule
# déclenche un rollback automatique. Les migrations ne sont JAMAIS annulées.
# =============================================================
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/srv/cvpro225}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-cvpro225.com}"
HTTPS_PORT="${HTTPS_PORT:-443}"
CHECK_IP="${CHECK_IP:-127.0.0.1}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-120}"
KEEP_IMAGES="${KEEP_IMAGES:-5}"
APP_CONTAINER="cvpro225-app"
APP_IMAGE="cvpro225-app"
STATE_DIR="$APP_DIR/.deploy"

log()  { printf '\033[1;34m==> %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m[ok] %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m[x] %s\033[0m\n' "$1" >&2; exit "${2:-1}"; }

cd "$APP_DIR"
mkdir -p "$STATE_DIR"
exec 9>"$STATE_DIR/lock"
flock -n 9 || die "Un déploiement est déjà en cours."

current()  { cat "$STATE_DIR/current"  2>/dev/null || true; }
previous() { cat "$STATE_DIR/previous" 2>/dev/null || true; }

running_image() {
  docker inspect -f '{{.Config.Image}}' "$APP_CONTAINER" 2>/dev/null || true
}

# Bascule le conteneur app sur une image déjà construite
switch_to() {
  local tag="$1"
  docker image inspect "$APP_IMAGE:$tag" &>/dev/null || die "Image $APP_IMAGE:$tag introuvable."
  log "Bascule sur $APP_IMAGE:$tag"
  IMAGE_TAG="$tag" docker compose up -d --no-build --pull never app
}

# Attend le healthcheck Docker puis vérifie le routage via Traefik
verify() {
  local tag="$1" waited=0 status
  log "Vérification de santé (max ${HEALTH_TIMEOUT}s)"
  while :; do
    status=$(docker inspect -f '{{.State.Health.Status}}' "$APP_CONTAINER" 2>/dev/null || echo absent)
    [[ "$status" == healthy ]] && break
    if [[ "$status" == unhealthy ]] || (( waited >= HEALTH_TIMEOUT )); then
      warn "Conteneur $status après ${waited}s. Derniers logs :"
      docker logs --tail 30 "$APP_CONTAINER" 2>&1 | sed 's/^/    /' || true
      return 1
    fi
    sleep 3; waited=$((waited + 3))
  done
  [[ "$(running_image)" == "$APP_IMAGE:$tag" ]] || { warn "Image en cours : $(running_image)"; return 1; }
  ok "Conteneur healthy (${waited}s)"

  # -k : on teste ici le routage Traefik -> app ; le certificat est vérifié à part
  local body
  if body=$(curl -fsSk --max-time 10 --retry 5 --retry-delay 2 --retry-all-errors \
              --resolve "$DOMAIN:$HTTPS_PORT:$CHECK_IP" "https://$DOMAIN:$HTTPS_PORT/api/health"); then
    ok "https://$DOMAIN/api/health via Traefik : $body"
  else
    warn "https://$DOMAIN/api/health injoignable via Traefik"
    return 1
  fi
}

record_success() {
  local tag="$1" prev
  prev="$(current)"
  if [[ -n "$prev" && "$prev" != "$tag" ]]; then echo "$prev" > "$STATE_DIR/previous"; fi
  echo "$tag" > "$STATE_DIR/current"
  docker tag "$APP_IMAGE:$tag" "$APP_IMAGE:latest"
  echo "$(date -Is) $tag $(git log -1 --format=%s "$tag" 2>/dev/null || true)" >> "$STATE_DIR/history.log"
}

prune_images() {
  local keep_cur keep_prev
  keep_cur="$(current)"; keep_prev="$(previous)"
  { docker images "$APP_IMAGE" --format '{{.Tag}}' \
      | grep -vxE "latest|${keep_cur:-_}|${keep_prev:-_}" || true; } \
    | tail -n +"$((KEEP_IMAGES + 1))" \
    | while read -r t; do
        docker rmi "$APP_IMAGE:$t" "cvpro225-migrator:$t" &>/dev/null || true
      done
  docker image prune -f --filter "until=168h" &>/dev/null || true
}

cmd_status() {
  echo "Commit HEAD     : $(git rev-parse --short=12 HEAD) ($(git log -1 --format='%s' HEAD))"
  echo "Image courante  : $(current || true)"
  echo "Image précédente: $(previous || true)"
  echo "Conteneur       : $(running_image) — $(docker inspect -f '{{.State.Health.Status}}' "$APP_CONTAINER" 2>/dev/null || echo absent)"
}

cmd_rollback() {
  local prev cur
  prev="$(previous)"; cur="$(current)"
  [[ -n "$prev" ]] || die "Aucune image précédente enregistrée."
  warn "Rollback $cur -> $prev (le schéma de base de données n'est PAS restauré)"
  switch_to "$prev"
  verify "$prev" || die "Rollback lui-même en échec : intervention manuelle requise."
  echo "$cur"  > "$STATE_DIR/previous"
  echo "$prev" > "$STATE_DIR/current"
  docker tag "$APP_IMAGE:$prev" "$APP_IMAGE:latest"
  echo "$(date -Is) ROLLBACK $cur -> $prev" >> "$STATE_DIR/history.log"
  ok "Rollback terminé : $APP_IMAGE:$prev"
}

cmd_deploy() {
  local migrate=0 force=0
  for a in "$@"; do
    case "$a" in
      --migrate) migrate=1 ;;
      --force)   force=1 ;;
      *) die "Option inconnue : $a" ;;
    esac
  done

  # --- Pré-vérifications ---
  [[ -f .env ]] || die ".env absent dans $APP_DIR (cf. infra/server/README.md)."
  [[ "$(stat -c %a .env)" == 600 ]] || warn ".env devrait être en 600 (chmod 600 .env)."
  docker network inspect web &>/dev/null || die "Réseau Docker 'web' absent."
  git diff --quiet && git diff --cached --quiet || die "Modifications locales non commitées sur le serveur."

  # --- Récupération du code ---
  local old_commit new_commit tag
  old_commit="$(git rev-parse HEAD)"
  log "git pull ($BRANCH)"
  git fetch --quiet origin "$BRANCH"
  git merge --ff-only --quiet "origin/$BRANCH" || die "Fast-forward impossible (historique divergent)."
  new_commit="$(git rev-parse HEAD)"
  tag="$(git rev-parse --short=12 HEAD)"
  echo "    $(git log -1 --format='%h %s (%an, %ar)' HEAD)"

  if [[ "$tag" == "$(current)" && $force -eq 0 ]]; then
    ok "Déjà déployé ($tag). Rien à faire (--force pour reconstruire)."
    return 0
  fi

  # --- Migrations en attente ? ---
  local base new_migrations=""
  base="$(current)"
  if [[ -n "$base" ]] && git cat-file -e "$base^{commit}" 2>/dev/null; then
    new_migrations="$(git diff --name-only --diff-filter=A "$base" HEAD -- 'prisma/migrations/*/migration.sql' || true)"
    if git diff --quiet "$base" HEAD -- prisma/schema.prisma; then :; elif [[ -z "$new_migrations" ]]; then
      warn "schema.prisma modifié SANS nouvelle migration : vérifier avant de continuer."
    fi
  elif [[ -z "$base" ]]; then
    warn "Premier déploiement via ce script : les migrations ne sont pas détectées automatiquement."
    warn "Vérifier l'état avec : docker compose --profile migrate run --rm migrate npx --no-install prisma migrate status"
  fi

  # --- Build (l'ancienne version continue de tourner pendant ce temps) ---
  log "Build de $APP_IMAGE:$tag"
  IMAGE_TAG="$tag" docker compose build app

  if [[ -n "$new_migrations" ]]; then
    log "Nouvelles migrations détectées :"
    printf '    %s\n' $new_migrations
    local mig_cmd="IMAGE_TAG=$tag docker compose --profile migrate run --rm migrate"
    echo "    Commande : $mig_cmd"
    if (( ! migrate )); then
      warn "Image construite mais NON déployée. Relancer avec --migrate pour appliquer puis basculer."
      exit 2
    fi
    [[ -t 0 ]] || die "Confirmation interactive requise pour migrer (lancer depuis un terminal)."
    IMAGE_TAG="$tag" docker compose --profile migrate build migrate
    read -r -p "Taper MIGRER pour exécuter cette commande sur la base de PRODUCTION : " answer
    [[ "$answer" == "MIGRER" ]] || die "Migration annulée. Rien n'a été déployé." 2
    IMAGE_TAG="$tag" docker compose --profile migrate run --rm migrate \
      || die "Migration en échec : l'application n'a PAS été basculée (toujours sur $(current))."
    ok "Migrations appliquées"
  fi

  # --- Bascule + vérification + rollback automatique ---
  local prev
  prev="$(current)"
  switch_to "$tag"
  if verify "$tag"; then
    record_success "$tag"
    prune_images
    ok "Déployé : $APP_IMAGE:$tag (${old_commit:0:12} -> ${new_commit:0:12})"
  else
    if [[ -n "$prev" ]]; then
      warn "Échec : rollback automatique vers $prev"
      switch_to "$prev"
      verify "$prev" || warn "Rollback en échec : intervention manuelle requise."
      echo "$(date -Is) FAILED $tag -> rollback $prev" >> "$STATE_DIR/history.log"
    fi
    die "Déploiement de $tag en échec."
  fi
}

case "${1:-deploy}" in
  deploy)   shift || true; cmd_deploy "$@" ;;
  --*)      cmd_deploy "$@" ;;
  rollback) cmd_rollback ;;
  status)   cmd_status ;;
  *)        die "Usage : $0 [deploy] [--migrate] [--force] | rollback | status" ;;
esac
