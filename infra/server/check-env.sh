#!/usr/bin/env bash
# =============================================================
# Vérifie les fichiers .env SANS JAMAIS AFFICHER LES VALEURS.
# Affiche seulement : nom, état (ok / VIDE / À REMPLACER / FORMAT ?).
#   infra/server/check-env.sh            (depuis /srv/cvpro225)
# Code de sortie 1 si une variable requise n'est pas prête.
# =============================================================
set -uo pipefail
cd "${APP_DIR:-/srv/cvpro225}"

fail=0
# Lit la valeur d'une variable dans un fichier dotenv (dernière occurrence), sans l'afficher.
val() { awk -v k="$1" 'index($0, k"=")==1 { v=substr($0, length(k)+2) } END { print v }' "$2" 2>/dev/null; }

# check FICHIER VAR [regex de forme attendue] [description de la forme]
check() {
  local file="$1" var="$2" re="${3:-}" desc="${4:-}" v status
  v="$(val "$var" "$file")"
  v="${v%\"}"; v="${v#\"}"
  if [[ -z "$v" ]]; then status="VIDE"; fail=1
  elif [[ "$v" == *"<"*">"* || "$v" == your-* || "$v" == *-here ]]; then status="À REMPLACER (gabarit)"; fail=1
  elif [[ -n "$re" && ! "$v" =~ $re ]]; then status="FORMAT ? ($desc)"; fail=1
  else status="ok"
  fi
  printf '  %-34s %s\n' "$var" "$status"
}

optional() {
  local file="$1" var="$2" v
  v="$(val "$var" "$file")"
  printf '  %-34s %s\n' "$var" "$([[ -n "$v" ]] && echo "renseignée (optionnelle)" || echo "vide (optionnelle)")"
}

perm() {
  local f="$1"
  if [[ ! -f "$f" ]]; then echo "  $f : ABSENT"; fail=1; return; fi
  local p; p="$(stat -c %a "$f")"
  [[ "$p" == 600 ]] && echo "  $f : permissions 600 ok" || { echo "  $f : permissions $p (attendu 600)"; fail=1; }
}

echo "== Fichiers"
perm .env
perm infra/traefik/.env
perm infra/traefik/letsencrypt/acme.json
perm infra/traefik/letsencrypt/acme-staging.json

E=.env
echo "== .env (app) — requises"
check $E NEXT_PUBLIC_APP_URL        '^https://cvpro225\.com$'                 'https://cvpro225.com'
check $E NEXT_PUBLIC_WHATSAPP
check $E NEXT_PUBLIC_EMAIL          '^[^@[:space:]]+@[^@[:space:]]+$'         'email'
check $E SUPABASE_URL               '^https://[a-z0-9]+\.supabase\.co/?$'     'https://<ref>.supabase.co'
check $E SUPABASE_SERVICE_ROLE_KEY  '^.{40,}$'                                'clé longue'
check $E AUTH_SECRET                '^.{32,}$'                                '>= 32 caractères'
check $E AUTH_TRUST_HOST            '^true$'                                  'true'
check $E NEXTAUTH_URL               '^https://cvpro225\.com$'                 'https://cvpro225.com'
check $E DATABASE_URL               '^postgres(ql)?://.+:6543/.+pgbouncer=true' 'pooler :6543 + pgbouncer=true'
check $E DIRECT_URL                 '^postgres(ql)?://.+:5432/'               'port 5432'
check $E RESEND_API_KEY             '^re_'                                    'commence par re_'
check $E ADMIN_EMAIL                '^[^@[:space:]]+@[^@[:space:]]+$'         'email'
check $E PAYDUNYA_MODE              '^(test|live)$'                           'test|live'
check $E PAYDUNYA_WEBHOOK_URL       '^https://cvpro225\.com/api/webhooks/paydunya$' 'URL webhook prod'
check $E ANTHROPIC_API_KEY          '^sk-ant-'                                'commence par sk-ant-'
check $E CV_ANALYSIS_IP_LIMIT       '^[0-9]+$'                                'entier'
check $E CV_ANALYSIS_GLOBAL_DAILY_LIMIT '^[0-9]+$'                            'entier'
echo "== .env (app) — PayDunya (optionnel)"
# Les 3 clés vides = paiement en ligne désactivé (accepté, avec avertissement).
# Partiellement renseigné = incohérent -> erreur.
pd_set=0
for v in PAYDUNYA_MASTER_KEY PAYDUNYA_PRIVATE_KEY PAYDUNYA_TOKEN; do
  [[ -n "$(val "$v" "$E")" ]] && pd_set=$((pd_set+1))
done
if (( pd_set == 0 )); then
  for v in PAYDUNYA_MASTER_KEY PAYDUNYA_PRIVATE_KEY PAYDUNYA_TOKEN; do
    printf '  %-34s %s\n' "$v" "vide (optionnelle)"
  done
  echo "  AVERTISSEMENT : PayDunya non configuré — paiement en ligne désactivé"
  echo "                  (les clients voient « Paiement en ligne bientôt disponible »)."
else
  check $E PAYDUNYA_MASTER_KEY '^[A-Za-z0-9_-]{10,}$'          '≥ 10 car. alphanumériques'
  check $E PAYDUNYA_PRIVATE_KEY '^(test|live)_private_'        'test_private_… ou live_private_…'
  check $E PAYDUNYA_TOKEN       '^[A-Za-z0-9_-]{10,}$'          '≥ 10 car. alphanumériques'
  (( pd_set < 3 )) && echo "  PayDunya partiellement configuré : renseignez les 3 clés ou videz-les toutes."
fi

echo "== .env (app) — offre de lancement"
lod="$(val LAUNCH_OFFER_END_DATE "$E")"; lod="${lod%\"}"; lod="${lod#\"}"
if [[ -z "$lod" ]]; then
  printf '  %-34s %s\n' LAUNCH_OFFER_END_DATE "vide — prix NORMAUX appliqués (pas d'offre de lancement)"
elif [[ "$lod" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] && date -d "$lod" +%F >/dev/null 2>&1 && [[ "$(date -d "$lod" +%F)" == "$lod" ]]; then
  if [[ "$(date -u +%F)" > "$lod" ]]; then
    printf '  %-34s %s\n' LAUNCH_OFFER_END_DATE "ok — offre TERMINÉE le $lod, prix normaux"
  else
    printf '  %-34s %s\n' LAUNCH_OFFER_END_DATE "ok — offre de lancement active jusqu'au $lod inclus"
  fi
else
  printf '  %-34s %s\n' LAUNCH_OFFER_END_DATE "FORMAT ? (AAAA-MM-JJ, date réelle)"; fail=1
fi

echo "== .env (app) — optionnelles"
for v in ADMIN_BCC_EMAIL NEXT_PUBLIC_STRAPI_URL STRAPI_URL STRAPI_API_TOKEN GOOGLE_VERIFICATION CV_RATE_LIMIT_WHITELIST SEED_ADMIN_PASSWORD; do
  optional $E "$v"
done

T=infra/traefik/.env
echo "== infra/traefik/.env"
check $T ACME_EMAIL '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' 'email réel'
ca="$(val ACME_CA_SERVER $T)"
printf '  %-34s %s\n' "Mode Let's Encrypt" "$([[ "$ca" == *acme-v02.api.letsencrypt.org* ]] && echo PRODUCTION || echo STAGING)"

echo
(( fail == 0 )) && echo "Tout est prêt." || echo "Des variables requises ne sont pas prêtes (voir ci-dessus)."
exit $fail
