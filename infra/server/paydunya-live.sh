#!/usr/bin/env bash
# =============================================================
# Passage de PayDunya en PRODUCTION (live), sur le serveur.
#   ~/bin/paydunya-live.sh            (APP_DIR par défaut : /srv/cvpro225)
#
# - Demande Master Key, Private Key et Token de PRODUCTION en saisie masquée.
# - Tout ou rien : si une valeur manque ou est invalide, RIEN n'est modifié.
# - Remplace les clés sandbox dans .env, passe PAYDUNYA_MODE=live, garde 600.
# - N'affiche jamais une valeur (seulement sa longueur) ; rien dans l'historique
#   shell ni dans un argument de commande (builtins bash uniquement).
# - Ne redémarre rien : recréer ensuite le conteneur app.
# =============================================================
set -uo pipefail
umask 077
ulimit -c 0 2>/dev/null || true

APP_DIR="${APP_DIR:-/srv/cvpro225}"
ENV_FILE="$APP_DIR/.env"
[[ -f "$ENV_FILE" ]] || { echo "Fichier introuvable : $ENV_FILE" >&2; exit 1; }

TMPF=""
cleanup() { stty echo 2>/dev/null; [[ -n "$TMPF" && -f "$TMPF" ]] && rm -f "$TMPF"; MK=""; PK=""; TK=""; }
trap cleanup EXIT
trap 'echo; echo "Interrompu : aucune modification."; exit 130' INT TERM

if [[ -t 1 ]]; then B=$'\e[1m'; R=$'\e[31m'; G=$'\e[32m'; Y=$'\e[33m'; N=$'\e[0m'; else B=; R=; G=; Y=; N=; fi

# Saisie masquée + nettoyage (espaces, guillemets, "VAR=" collé par erreur)
lire() {
  local var="$1" label="$2" v
  read -rsp "  $label (masquée) : " v; echo
  v="${v#"${v%%[![:space:]]*}"}"; v="${v%"${v##*[![:space:]]}"}"
  [[ "$v" == "$var="* ]] && v="${v#"$var="}"
  if [[ "$v" == \"*\" || "$v" == \'*\' ]] && (( ${#v} >= 2 )); then v="${v:1:${#v}-2}"; fi
  printf -v "$3" '%s' "$v"
}

echo "${B}Passage de PayDunya en PRODUCTION${N}"
echo "Clés à prendre dans PayDunya → Intégrez notre API → votre application → mode Production."
echo "Rien ne s'affiche pendant la saisie. Ctrl-C pour annuler sans rien modifier."
echo

MK=""; PK=""; TK=""
lire PAYDUNYA_MASTER_KEY  "Master Key (clé principale)" MK
lire PAYDUNYA_PRIVATE_KEY "Private Key (live_private_…)" PK
lire PAYDUNYA_TOKEN       "Token" TK

err=0
[[ "$MK" =~ ^[A-Za-z0-9_-]{10,}$ ]] || { echo "  ${R}✗ Master Key : format inattendu (${#MK} car.)${N}"; err=1; }
if [[ "$PK" == test_private_* ]]; then
  echo "  ${R}✗ Private Key : c'est une clé de TEST (test_private_…), pas de production${N}"; err=1
elif [[ ! "$PK" =~ ^live_private_[A-Za-z0-9]+$ ]]; then
  echo "  ${R}✗ Private Key : doit commencer par live_private_ (${#PK} car. reçus)${N}"; err=1
fi
[[ "$TK" =~ ^[A-Za-z0-9_-]{10,}$ ]] || { echo "  ${R}✗ Token : format inattendu (${#TK} car.)${N}"; err=1; }
if (( err )); then echo; echo "${Y}Aucune modification. Relancez le script.${N}"; exit 1; fi

# Réécriture atomique : remplace les lignes existantes (ou ajoute), garde le reste à l'identique.
declare -A NEW=([PAYDUNYA_MASTER_KEY]="$MK" [PAYDUNYA_PRIVATE_KEY]="$PK" [PAYDUNYA_TOKEN]="$TK" [PAYDUNYA_MODE]="live")
declare -A DONE=()
TMPF="$(mktemp "$APP_DIR/.paydunya-live.XXXXXX")" || exit 1
chmod 600 "$TMPF"
{
  while IFS= read -r line || [[ -n "$line" ]]; do
    k="${line%%=*}"
    if [[ "$line" == *=* && -n "${NEW[$k]+x}" ]]; then
      (( ${DONE[$k]-0} )) || printf '%s=%s\n' "$k" "${NEW[$k]}"
      DONE[$k]=1
    else
      printf '%s\n' "$line"
    fi
  done < "$ENV_FILE"
  for k in PAYDUNYA_MASTER_KEY PAYDUNYA_PRIVATE_KEY PAYDUNYA_TOKEN PAYDUNYA_MODE; do
    (( ${DONE[$k]-0} )) || printf '%s=%s\n' "$k" "${NEW[$k]}"
  done
} > "$TMPF" || { echo "${R}Écriture impossible : aucune modification.${N}"; exit 1; }
mv -f "$TMPF" "$ENV_FILE" && TMPF="" && chmod 600 "$ENV_FILE"
unset 'NEW[PAYDUNYA_MASTER_KEY]' 'NEW[PAYDUNYA_PRIVATE_KEY]' 'NEW[PAYDUNYA_TOKEN]'

echo "  ${G}✓ Master Key enregistrée (${#MK} car.)${N}"
echo "  ${G}✓ Private Key de production enregistrée (${#PK} car.)${N}"
echo "  ${G}✓ Token enregistré (${#TK} car.)${N}"
echo "  ${G}✓ PAYDUNYA_MODE=live${N}"
echo "  Permissions .env : $(stat -c %a "$ENV_FILE")"
echo
echo "${B}Prochaine étape :${N} recréer le conteneur app pour charger les clés :"
echo "  cd $APP_DIR && docker compose up -d --force-recreate --no-build app"
