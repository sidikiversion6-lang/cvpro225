# CVPro225 — déploiement

Méthode : dépôt GitHub **privé**, **deploy key en lecture seule** générée sur le serveur,
`git pull` + `docker compose build` **sur le serveur** dans `/srv/cvpro225`.

Prérequis : [README.md](README.md) étapes 1 à 3 (serveur préparé, `.env` remplis).

---

## A. Créer le dépôt GitHub et pousser (sur le Mac)

```bash
cd ~/Desktop/Projets\ Web/cvpro225

# 0. Vérifier qu'aucun secret n'est suivi : ne doit lister QUE des .env.example
git ls-files | grep -iE '(^|/)\.env|acme|\.pem$|\.key$'
git log -p --all | grep -c "Admin@2025"          # doit afficher 0
```

1. Sur <https://github.com/new> : nom `cvpro225`, **Private**, **sans** README / .gitignore / licence.
2. Puis :

```bash
git remote add origin git@github.com:<TON_COMPTE>/cvpro225.git
git push -u origin main
```

> Variante CLI : `brew install gh && gh auth login`, puis
> `gh repo create cvpro225 --private --source=. --remote=origin --push`.

## B. Deploy key en lecture seule (sur le serveur, user `deploy`)

```bash
ssh deploy@IP_DU_SERVEUR

ssh-keygen -t ed25519 -N "" -C "deploy@cvpro225-vps (read-only)" -f ~/.ssh/github_cvpro225

cat >> ~/.ssh/config <<'EOF'
Host github-cvpro225
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_cvpro225
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config

# Empreinte GitHub : DOIT afficher SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU
ssh-keyscan -t ed25519 github.com 2>/dev/null | tee -a ~/.ssh/known_hosts | ssh-keygen -lf -

cat ~/.ssh/github_cvpro225.pub          # à copier
```

Sur GitHub : dépôt → **Settings → Deploy keys → Add deploy key**
- Title : `vps-cvpro225 (read-only)`
- Key : contenu de `github_cvpro225.pub`
- **Ne PAS cocher « Allow write access »**

```bash
ssh -T github-cvpro225     # "Hi <TON_COMPTE>/cvpro225! You've successfully authenticated…"
git clone github-cvpro225:<TON_COMPTE>/cvpro225.git /srv/cvpro225
```

## C. Premier déploiement (dans l'ordre)

### C0. Pré-vérifications

```bash
dig +short cvpro225.com ; dig +short www.cvpro225.com     # → IP du serveur
dig +short AAAA cvpro225.com                               # vide, ou IPv6 de CE serveur
cd /srv/cvpro225
cp .env.example .env && nano .env && chmod 600 .env        # checklist README §2
cp infra/traefik/.env.example infra/traefik/.env && nano infra/traefik/.env   # ACME_EMAIL réel, mode staging
chmod 600 infra/traefik/.env
install -m 600 /dev/null infra/traefik/letsencrypt/acme.json
install -m 600 /dev/null infra/traefik/letsencrypt/acme-staging.json
```

### C1. Traefik en **staging**

```bash
cd /srv/cvpro225/infra/traefik
docker compose up -d
docker compose ps                                   # traefik "healthy", socket-proxy "Up"
docker logs traefik 2>&1 | grep -iE "error|too old" # rien d'inquiétant
curl -sI http://cvpro225.com | head -3              # 301 → https://cvpro225.com/
curl -skI https://cvpro225.com | head -1            # 404 (normal : pas encore d'app)
```

### C2. Migration — **je ne lance rien : tu exécutes chaque commande**

```bash
cd /srv/cvpro225
docker compose --profile migrate build migrate

# (lecture seule) tables existantes ?
docker run --rm -it --env-file .env postgres:17-alpine sh -c 'psql "$DIRECT_URL" -c "\dt public.*"'

# (lecture seule) état Prisma
docker compose --profile migrate run --rm migrate npx --no-install prisma migrate status
```

**Cas A — aucune table Prisma** (`User`, `commandes`, `packs`… absentes) :

```bash
docker compose --profile migrate run --rm migrate          # = prisma migrate deploy
```

**Cas B — tables Prisma déjà présentes** : comparer d'abord (lecture seule) ; la sortie ne doit
contenir que des `DROP` de `cv_analyses_log` / `cv_leads` (tables hors Prisma, à **ignorer**) :

```bash
docker compose --profile migrate run --rm migrate sh -c \
  'npx --no-install prisma migrate diff --from-url "$DIRECT_URL" --to-schema-datamodel prisma/schema.prisma --script'
# si OK, baseline :
docker compose --profile migrate run --rm migrate npx --no-install prisma migrate resolve --applied 0_init
```

> ⛔ Jamais `prisma migrate dev` ni `prisma db push` sur la base Supabase.

### C3. Application

```bash
cd /srv/cvpro225
infra/server/deploy.sh             # build, démarrage, healthcheck, vérif via Traefik
```

Vérifier le certificat **staging** (émis automatiquement dès que le routeur existe) :

```bash
docker logs traefik 2>&1 | grep -i acme | tail -5
curl -skv https://cvpro225.com 2>&1 | grep -i "issuer"     # contient "(STAGING)"
curl -skI https://www.cvpro225.com | grep -i location      # https://cvpro225.com/
```

### C4. Passage Let's Encrypt **production**

```bash
cd /srv/cvpro225/infra/traefik
nano .env      # décommenter ACME_CA_SERVER=…acme-v02… et ACME_STORAGE=/letsencrypt/acme.json
docker compose up -d --force-recreate
sleep 30
curl -sv https://cvpro225.com 2>&1 | grep -iE "issuer|SSL certificate verify"   # Let's Encrypt, verify ok (sans -k)
curl -sI https://www.cvpro225.com | grep -iE "^HTTP|location"                  # 301 → https://cvpro225.com/
curl -s https://cvpro225.com/api/health
```

## D. Mises à jour suivantes

```bash
ssh deploy@IP_DU_SERVEUR
cd /srv/cvpro225
infra/server/deploy.sh               # pull + build + bascule + vérif (+ rollback auto si échec)
infra/server/deploy.sh --migrate     # si de nouvelles migrations sont détectées (confirmation "MIGRER")
infra/server/deploy.sh status
infra/server/deploy.sh rollback      # revient à l'image précédente (la BDD n'est PAS restaurée)
```

Comportement de `deploy.sh` :
- refuse s'il y a des modifications locales ou un historique divergent ;
- l'ancienne version tourne pendant le build ; coupure de quelques secondes à la bascule ;
- nouvelles migrations détectées → **image construite mais non déployée** (code 2) tant que
  `--migrate` n'est pas passé ; avec `--migrate`, affiche la commande et exige de taper `MIGRER` ;
  si la migration échoue, l'application n'est pas basculée ;
- healthcheck Docker puis `https://cvpro225.com/api/health` via Traefik ; en cas d'échec,
  rollback automatique (détection d'un conteneur `unhealthy` en ~80 s) ;
- garde les 5 dernières images taguées par commit ; historique dans `.deploy/history.log`.

**Migrations :** toujours rétro-compatibles (ajouter avant de supprimer), car un rollback
d'image ne restaure pas le schéma.

## E. PayDunya

Dans le tableau de bord PayDunya (<https://paydunya.com>) :

1. **Compte activé pour la production** (vérification KYC terminée), sinon les clés live sont refusées.
2. **Intégrer l'API → application** : passer en mode **Production**, récupérer les clés live
   (`MASTER_KEY`, `PRIVATE_KEY`, `TOKEN`) → `.env` avec `PAYDUNYA_MODE=live`.
3. **URL IPN / callback** : `https://cvpro225.com/api/webhooks/paydunya`
   (le code l'envoie aussi à chaque facture via `callback_url`, ce qui prime sur le réglage global ;
   le renseigner quand même en secours).
4. URLs de retour / annulation : rien à régler, dérivées de `NEXT_PUBLIC_APP_URL`
   (`/commander/paiement/retour` et `/annule`).
5. **Faire d'abord un paiement de bout en bout en mode `test`** sur le serveur (certificat
   production en place), vérifier que la commande passe à `confirmed` et que les emails partent.

> ⚠️ Voir « Points bloquants » ci-dessous : le webhook actuel ne lit pas le format envoyé par PayDunya.

## F. Resend

1. <https://resend.com/domains> → **Add domain** `cvpro225.com` (région la plus proche, ex. `eu-west-1`).
2. Ajouter **exactement** les enregistrements DNS fournis par Resend (valeurs à copier depuis le dashboard) :
   - `MX  send.cvpro225.com` → `feedback-smtp.<région>.amazonses.com` (priorité 10)
   - `TXT send.cvpro225.com` → `v=spf1 include:amazonses.com ~all`
   - `TXT resend._domainkey.cvpro225.com` → clé DKIM
   Ces enregistrements sont sur le sous-domaine `send.` : ils ne touchent pas au MX/SPF de la
   boîte `contact@cvpro225.com`.
3. Recommandé : `TXT _dmarc.cvpro225.com` → `v=DMARC1; p=none; rua=mailto:<adresse>` (durcir à `quarantine` ensuite).
4. Attendre le statut **Verified**, puis **API Keys → Create** : permission *Sending access*,
   domaine `cvpro225.com` uniquement, clé dédiée à la prod → `RESEND_API_KEY`.
5. Tester : formulaire de contact + commande test → réception + en-têtes SPF/DKIM `pass`.

## Points bloquants avant ouverture

1. **Webhook PayDunya** (`app/api/webhooks/paydunya/route.ts`) : il lit le corps avec
   `request.json()`, or PayDunya envoie l'IPN en `application/x-www-form-urlencoded`
   (`data[invoice][token]`, `data[hash]`…). La lecture échoue → aucune commande n'est jamais
   confirmée (la page retour se contente de lire le statut en base).
2. **RLS Supabase** : les tables Prisma sont créées dans `public` sans Row Level Security ; avec la
   clé `anon` (publique, dans le bundle JS), l'API REST Supabase exposerait `User` (hash des mots de
   passe), `commandes`, etc. Les politiques existantes autorisent aussi `anon` à lire **toutes**
   les lignes de `cv_leads` et `cv_analyses_log`, et à modifier toutes celles de `cv_analyses_log`.
