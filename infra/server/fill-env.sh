#!/usr/bin/env bash
# =============================================================
# Remplit interactivement les variables pas encore prêtes de
#   $APP_DIR/.env  puis  $APP_DIR/infra/traefik/.env
# d'après la sortie de infra/server/check-env.sh (VIDE / gabarit / FORMAT ?).
#
#   ~/bin/fill-env.sh                 (APP_DIR par défaut : /srv/cvpro225)
#
# - Secrets saisis en masqué (read -rs), le reste en clair.
# - Entrée vide = passer la variable ; relancer le script plus tard.
# - Chaque valeur validée est écrite tout de suite (Ctrl-C ne perd rien),
#   sans sed ni argument de ligne de commande, fichier réécrit atomiquement en 600.
# - N'affiche jamais une valeur secrète (seulement sa longueur).
# =============================================================
set -uo pipefail
umask 077
ulimit -c 0 2>/dev/null || true

APP_DIR="${APP_DIR:-/srv/cvpro225}"
CHECK="$APP_DIR/infra/server/check-env.sh"
cd "$APP_DIR" || { echo "Dossier introuvable : $APP_DIR" >&2; exit 1; }
[[ -f "$CHECK" ]] || { echo "check-env.sh introuvable : $CHECK" >&2; exit 1; }

TMPF=""
cleanup() { stty echo 2>/dev/null; [[ -n "$TMPF" && -f "$TMPF" ]] && rm -f "$TMPF"; }
trap cleanup EXIT
trap 'echo; echo "Interrompu. Les valeurs déjà validées sont enregistrées."; exit 130' INT TERM

if [[ -t 1 ]]; then B=$'\e[1m'; D=$'\e[2m'; R=$'\e[31m'; G=$'\e[32m'; Y=$'\e[33m'; N=$'\e[0m'
else B=; D=; R=; G=; Y=; N=; fi

# ---------- fichiers ----------
ensure_file() {
  local f="$1" ex="$1.example" a
  if [[ ! -f "$f" ]]; then
    if [[ -f "$ex" ]]; then
      read -rp "$f absent. Le créer depuis $ex ? [O/n] " a
      [[ "$a" =~ ^[nN] ]] && return 1
      cp "$ex" "$f"
    else
      : > "$f"
    fi
  fi
  chmod 600 "$f"
}

# set_var FICHIER VAR VALEUR — remplace toutes les lignes VAR=… (ou ajoute à la fin).
# Uniquement des builtins bash : la valeur n'apparaît dans aucun argv ni historique.
set_var() {
  local file="$1" key="$2" val="$3" line found=0 out
  case "$val" in *[[:space:]\#\']*) out="$key=\"$val\"" ;; *) out="$key=$val" ;; esac
  TMPF="$(mktemp "$(dirname "$file")/.fill-env.XXXXXX")" || return 1
  chmod 600 "$TMPF"
  {
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" == "$key="* ]]; then
        (( found )) || printf '%s\n' "$out"
        found=1
      else
        printf '%s\n' "$line"
      fi
    done < "$file"
    (( found )) || printf '%s\n' "$out"
  } > "$TMPF" || { rm -f "$TMPF"; TMPF=""; return 1; }
  mv -f "$TMPF" "$file" && TMPF="" && chmod 600 "$file"
}

# ---------- aide / format par variable ----------
# Remplit : HELP EXAMPLE SECRET(0/1) RE DESC
EMAIL_RE='^[^@[:space:]]+@[^@[:space:]]+\.[A-Za-z]{2,}$'
spec() {
  HELP=""; EXAMPLE=""; SECRET=0; RE=""; DESC=""
  case "$1" in
    NEXT_PUBLIC_APP_URL|NEXTAUTH_URL)
      HELP="URL publique du site, sans / final."; EXAMPLE="https://cvpro225.com"
      RE='^https://cvpro225\.com$'; DESC="exactement https://cvpro225.com" ;;
    NEXT_PUBLIC_WHATSAPP)
      HELP="Numéro WhatsApp affiché sur le site, format international (espaces permis)."
      EXAMPLE="+225 07 00 00 00 00"; RE='^\+[0-9][0-9 ]{6,18}[0-9]$'; DESC="+indicatif puis chiffres" ;;
    NEXT_PUBLIC_EMAIL)
      HELP="Email de contact affiché sur le site."; EXAMPLE="contact@exemple.com"; RE="$EMAIL_RE"; DESC="email" ;;
    ADMIN_EMAIL)
      HELP="Adresse qui reçoit les notifications admin (commandes, leads)."; EXAMPLE="admin@exemple.com"; RE="$EMAIL_RE"; DESC="email" ;;
    SUPABASE_URL)
      HELP="Supabase → Project Settings → Data API → Project URL."
      EXAMPLE="https://abcdefghijklmnopqrst.supabase.co"; RE='^https://[a-z0-9]+\.supabase\.co$'; DESC="https://<ref>.supabase.co" ;;
    SUPABASE_SERVICE_ROLE_KEY)
      HELP="Supabase → Project Settings → API Keys → service_role (secret). PAS la clé anon/publishable."
      EXAMPLE="eyJhbGciOiJIUzI1NiIs…  (~200 car.)  ou  sb_secret_…"; SECRET=1
      RE='^(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sb_secret_[A-Za-z0-9_-]{20,})$'; DESC="JWT eyJ… ou sb_secret_…" ;;
    AUTH_SECRET)
      HELP="Secret NextAuth, ≥ 32 caractères. Tapez ${B}gen${N} pour en générer un (openssl rand -base64 32)."
      EXAMPLE="(44 caractères base64)"; SECRET=1; RE='^.{32,}$'; DESC="≥ 32 caractères" ;;
    AUTH_TRUST_HOST)
      HELP="Obligatoire derrière Traefik."; EXAMPLE="true"; RE='^true$'; DESC="true" ;;
    DATABASE_URL)
      HELP="Supabase → Connect → ${B}Transaction pooler${N} (port 6543). Remplacez [YOUR-PASSWORD] ; encodez les caractères spéciaux du mot de passe (@→%40 #→%23 \$→%24 /→%2F espace→%20). ?pgbouncer=true&connection_limit=1 est ajouté automatiquement."
      EXAMPLE="postgresql://postgres.REF:MOTDEPASSE@aws-0-REGION.pooler.supabase.com:6543/postgres"; SECRET=1
      RE='^postgres(ql)?://[^@/:]+:[^@/]+@[^@/:]+:6543/[^/?]+(\?.*)?$'; DESC="postgresql://user:mdp@hôte:6543/base" ;;
    DIRECT_URL)
      HELP="Supabase → Connect → ${B}Session pooler${N} (port 5432) — utilisé pour les migrations. Même mot de passe encodé que DATABASE_URL."
      EXAMPLE="postgresql://postgres.REF:MOTDEPASSE@aws-0-REGION.pooler.supabase.com:5432/postgres"; SECRET=1
      RE='^postgres(ql)?://[^@/:]+:[^@/]+@[^@/:]+:5432/[^/?]+(\?.*)?$'; DESC="postgresql://user:mdp@hôte:5432/base" ;;
    RESEND_API_KEY)
      HELP="resend.com → API Keys → Create API Key (Sending access, domaine cvpro225.com)."
      EXAMPLE="re_XXXXXXXX_XXXXXXXXXXXXXXXXXXXXXXXX"; SECRET=1; RE='^re_[A-Za-z0-9_]{10,}$'; DESC="commence par re_" ;;
    PAYDUNYA_MASTER_KEY)
      HELP="PayDunya → Intégrez notre API → votre application → Clé principale (Master Key)."
      EXAMPLE="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"; SECRET=1; RE='^[A-Za-z0-9_-]{10,}$'; DESC="≥ 10 car. alphanumériques" ;;
    PAYDUNYA_PRIVATE_KEY)
      HELP="PayDunya → votre application → Clé privée (test_private_… en mode test, live_private_… en live)."
      EXAMPLE="test_private_XXXXXXXXXXXXXXXXXXXXXXXX"; SECRET=1; RE='^(test|live)_private_[A-Za-z0-9]+$'; DESC="test_private_… ou live_private_…" ;;
    PAYDUNYA_TOKEN)
      HELP="PayDunya → votre application → Token."
      EXAMPLE="XXXXXXXXXXXXXXXXXXXX"; SECRET=1; RE='^[A-Za-z0-9_-]{10,}$'; DESC="≥ 10 car. alphanumériques" ;;
    PAYDUNYA_MODE)
      HELP="test tant que les clés sont celles du sandbox, live ensuite."; EXAMPLE="test"; RE='^(test|live)$'; DESC="test ou live" ;;
    PAYDUNYA_WEBHOOK_URL)
      HELP="URL d'IPN déclarée chez PayDunya."; EXAMPLE="https://cvpro225.com/api/webhooks/paydunya"
      RE='^https://cvpro225\.com/api/webhooks/paydunya$'; DESC="URL webhook prod" ;;
    ANTHROPIC_API_KEY)
      HELP="console.anthropic.com → Settings → API Keys → Create Key."
      EXAMPLE="sk-ant-api03-XXXXXXXX…"; SECRET=1; RE='^sk-ant-[A-Za-z0-9_-]{20,}$'; DESC="commence par sk-ant-" ;;
    CV_ANALYSIS_IP_LIMIT)
      HELP="Analyses CV gratuites par IP sur 24 h."; EXAMPLE="1"; RE='^[0-9]+$'; DESC="entier" ;;
    CV_ANALYSIS_GLOBAL_DAILY_LIMIT)
      HELP="Plafond global d'analyses sur 24 h (0 = service fermé)."; EXAMPLE="100"; RE='^[0-9]+$'; DESC="entier" ;;
    ACME_EMAIL)
      HELP="Email réel pour les alertes d'expiration Let's Encrypt (pas example.com)."
      EXAMPLE="toi@exemple.com"; RE="$EMAIL_RE"; DESC="email réel" ;;
    *)
      HELP="(pas d'aide spécifique)"; EXAMPLE="—"; SECRET=1 ;;
  esac
}

# Contrôles supplémentaires ; ERR = message si refus. Peut normaliser VALUE.
extra_checks() {
  local var="$1" p
  ERR=""
  case "$VALUE" in
    *'$'*|*'"'*|*'\'*|*'`'*) ERR="caractères \$ \" \\ \` interdits dans .env (encodez-les dans une URL : \$→%24)"; return ;;
    *'<'*'>'*|*'['*']'*|*YOUR-PASSWORD*|your-*|*-here)
      ERR="ressemble encore à un gabarit (<…>, [YOUR-PASSWORD]…)"; return ;;
  esac
  case "$var" in
    SUPABASE_URL) VALUE="${VALUE%/}" ;;
    SUPABASE_SERVICE_ROLE_KEY)
      if [[ "$VALUE" == eyJ* ]]; then
        p="${VALUE#*.}"; p="${p%%.*}"; p="${p//-/+}"; p="${p//_//}"
        while (( ${#p} % 4 )); do p="$p="; done
        if ! printf '%s' "$p" | base64 -d 2>/dev/null | tr -d ' ' | grep -q '"role":"service_role"'; then
          ERR="ce JWT n'a pas le rôle service_role (clé anon collée ?)"; return
        fi
      fi ;;
    DATABASE_URL)
      if [[ "$VALUE" != *\?* ]]; then VALUE="$VALUE?pgbouncer=true&connection_limit=1"
      else
        [[ "$VALUE" == *pgbouncer=true* ]] || VALUE="$VALUE&pgbouncer=true"
        [[ "$VALUE" == *connection_limit=* ]] || VALUE="$VALUE&connection_limit=1"
      fi ;;
    DIRECT_URL)
      [[ "$VALUE" == *pgbouncer=true* ]] && ERR="DIRECT_URL ne doit pas contenir pgbouncer=true (session, port 5432)" ;;
    ACME_EMAIL)
      [[ "$VALUE" == *@example.* || "$VALUE" == *@exemple.* ]] && ERR="Let's Encrypt refuse example.com : mettez un email réel" ;;
  esac
}

# ---------- variables à traiter, d'après check-env.sh ----------
TODO=()   # éléments "fichier|VAR|statut"
section=""
while IFS= read -r line; do
  case "$line" in
    "== .env (app) — requises"*) section=".env" ;;
    "== .env (app)"*)            section="" ;;      # optionnelles : ignorées
    "== infra/traefik/.env"*)    section="infra/traefik/.env" ;;
    "=="*)                       section="" ;;
    *)
      [[ -z "$section" ]] && continue
      if [[ "$line" =~ ^\ \ ([A-Z][A-Z0-9_]*)\ +(VIDE|À\ REMPLACER.*|FORMAT\ \?.*)$ ]]; then
        TODO+=("$section|${BASH_REMATCH[1]}|${BASH_REMATCH[2]}")
      fi ;;
  esac
done < <(APP_DIR="$APP_DIR" bash "$CHECK" 2>/dev/null)

if (( ${#TODO[@]} == 0 )); then
  echo "${G}Aucune variable requise à remplir.${N}"
else
  echo "${B}${#TODO[@]} variable(s) à remplir.${N} Entrée vide = passer (relancez le script plus tard)."
  ensure_file .env || exit 1
  ensure_file infra/traefik/.env || exit 1
fi

i=0; written=0; skipped=0; public_changed=0
for item in ${TODO[@]+"${TODO[@]}"}; do
  i=$((i+1))
  file="${item%%|*}"; rest="${item#*|}"; var="${rest%%|*}"; status="${rest#*|}"
  spec "$var"
  echo
  echo "${B}[$i/${#TODO[@]}] $var${N}  ${D}($file — $status)${N}"
  echo "  $HELP"
  echo "  ${D}Format : $EXAMPLE${N}"
  while :; do
    VALUE=""
    if (( SECRET )); then
      read -rsp "  Valeur (masquée) : " VALUE; echo
    else
      read -rp  "  Valeur : " VALUE
    fi
    # nettoyage : espaces autour, guillemets autour, "VAR=" collé par erreur
    VALUE="${VALUE#"${VALUE%%[![:space:]]*}"}"; VALUE="${VALUE%"${VALUE##*[![:space:]]}"}"
    [[ "$VALUE" == "$var="* ]] && VALUE="${VALUE#"$var="}"
    if [[ "$VALUE" == \"*\" || "$VALUE" == \'*\' ]] && (( ${#VALUE} >= 2 )); then VALUE="${VALUE:1:${#VALUE}-2}"; fi

    if [[ -z "$VALUE" ]]; then echo "  ${Y}→ passée${N}"; skipped=$((skipped+1)); break; fi
    if [[ "$var" == AUTH_SECRET && "$VALUE" == gen ]]; then
      VALUE="$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)"
      [[ ${#VALUE} -ge 32 ]] || { echo "  ${R}génération impossible${N}"; continue; }
      echo "  secret généré"
    fi

    extra_checks "$var"
    if [[ -z "$ERR" && -n "$RE" && ! "$VALUE" =~ $RE ]]; then ERR="format attendu : $DESC"; fi
    if [[ -n "$ERR" ]]; then
      if (( SECRET )); then echo "  ${R}✗ $ERR${N} ${D}(reçu ${#VALUE} car.)${N} — recommencez ou Entrée pour passer."
      else echo "  ${R}✗ $ERR${N} — recommencez ou Entrée pour passer."; fi
      continue
    fi

    if set_var "$file" "$var" "$VALUE"; then
      (( SECRET )) && echo "  ${G}✓ enregistrée${N} ${D}(${#VALUE} caractères)${N}" || echo "  ${G}✓ enregistrée${N}"
      [[ "$var" == DATABASE_URL ]] && echo "  ${D}(paramètres pgbouncer/connection_limit vérifiés)${N}"
      [[ "$var" == NEXT_PUBLIC_* ]] && public_changed=1
      written=$((written+1))
    else
      echo "  ${R}✗ écriture impossible dans $file${N}"
    fi
    break
  done
  VALUE=""
done
unset VALUE

echo
(( ${#TODO[@]} )) && echo "${B}Bilan :${N} $written enregistrée(s), $skipped passée(s)."
(( public_changed )) && echo "${Y}NEXT_PUBLIC_* modifiée(s) : rebuild de l'image nécessaire.${N}"
echo
echo "${B}== check-env.sh${N}"
APP_DIR="$APP_DIR" bash "$CHECK"
