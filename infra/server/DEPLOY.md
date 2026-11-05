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

### C2. Base de données — **je ne lance rien : tu exécutes chaque commande**

État connu : la base ne contient que `cv_leads` et `cv_analyses_log` (aucune table Prisma).

> ⚠️ `prisma migrate deploy` seul **échoue** ici avec `P3005` (« schema is not empty ») :
> Prisma refuse d'appliquer la première migration dans un `public` non vide sans historique.
> Procédure Prisma pour ce cas : exécuter `0_init`, l'enregistrer comme appliquée, puis `deploy`.
> (Testé sur un Postgres reproduisant cet état.)

```bash
cd /srv/cvpro225
docker compose --profile migrate build migrate
M="docker compose --profile migrate run --rm migrate"

# 0. (lecture seule) confirmer l'état : seules cv_leads / cv_analyses_log, pas de _prisma_migrations
docker run --rm -it --env-file .env postgres:17-alpine sh -c 'psql "$DIRECT_URL" -c "\dt public.*"'

# 1. créer les 11 tables Prisma (contenu : prisma/migrations/0_init/migration.sql)
$M npx --no-install prisma db execute --file prisma/migrations/0_init/migration.sql --schema prisma/schema.prisma

# 2. enregistrer 0_init comme appliquée (crée _prisma_migrations)
$M npx --no-install prisma migrate resolve --applied 0_init

# 3. appliquer les migrations suivantes (1_enable_rls : RLS + REVOKE anon/authenticated)
$M                                   # = prisma migrate deploy

# 4. (lecture seule) doit afficher "Database schema is up to date!"
$M npx --no-install prisma migrate status
```

Puis, dans **Supabase → SQL Editor**, relire et exécuter dans l'ordre :

1. [`supabase/sql/01_cv_tables_access.sql`](../../supabase/sql/01_cv_tables_access.sql) — supprime
   les policies `anon` des tables `cv_*`, révoque `anon`/`authenticated`, droits `service_role`.
   **Prérequis : `SUPABASE_SERVICE_ROLE_KEY` est dans `.env`** (l'app n'utilise plus la clé anon).
2. [`supabase/sql/02_cv_leads_constraints.sql`](../../supabase/sql/02_cv_leads_constraints.sql) —
   lancer d'abord l'**étape 1 (diagnostic)** seule, vérifier les doublons, puis l'**étape 2**
   (sauvegarde `backup.cv_leads_20261105`, fusion, PK `(id)` + `UNIQUE(email)`).

3. [`supabase/sql/03_cv_rate_limit.sql`](../../supabase/sql/03_cv_rate_limit.sql) — fonction
   `cv_reserve_analysis` (rate-limit atomique par IP + plafond global), `EXECUTE` réservé à
   `service_role`. **Obligatoire** : sans elle, le CV Checker refuse toute analyse (fail-closed, 503).
4. **Après vérification de `02`** (quelques jours d'utilisation, leads corrects, pas de perte) :
   supprimer la sauvegarde, qui contient des données personnelles :

   ```sql
   SELECT count(*) FROM backup.cv_leads_20261105;   -- dernier coup d'œil
   DROP SCHEMA backup CASCADE;
   ```

Vérification finale (lecture seule) : toutes les tables de `public` ont RLS actif.

```sql
SELECT relname, relrowsecurity FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r' ORDER BY 1;
```

**Seed (optionnel : compte admin, services, packs, réglages)** — idempotent ; le mot de passe
n'apparaît ni dans l'historique shell ni dans un fichier :

```bash
read -rs -p "Mot de passe admin (≥ 12 caractères) : " SEED_ADMIN_PASSWORD; echo; export SEED_ADMIN_PASSWORD
docker compose --profile migrate run --rm -e SEED_ADMIN_PASSWORD migrate npx --no-install prisma db seed
unset SEED_ADMIN_PASSWORD
```

> ⛔ Jamais `prisma migrate dev` ni `prisma db push` sur la base Supabase.
> Toute future migration qui crée une table doit inclure `ALTER TABLE … ENABLE ROW LEVEL SECURITY`.

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

> Le webhook accepte le format IPN de PayDunya (form-urlencoded) et vérifie le hash SHA-512 : une
> `PAYDUNYA_MASTER_KEY` incorrecte se traduit par des IPN rejetés en 401 (visible dans `docker logs cvpro225-app`).

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

## Points corrigés (historique)

- **Webhook PayDunya** : lit le form-urlencoded (et le JSON), vérifie `data.hash` = SHA-512(MASTER_KEY),
  re-vérifie statut / montant / référence via l'API de confirmation, idempotent (pas de double email).
  Tests : `npm test`.
- **RLS Supabase** : migration `1_enable_rls` + `supabase/sql/01_cv_tables_access.sql` ; l'app utilise
  la clé `service_role` côté serveur uniquement (`server-only`), plus aucune clé Supabase dans le bundle.
- **Doublons `cv_leads`** : upsert sur `email` + `supabase/sql/02_cv_leads_constraints.sql` ;
  `/api/cv-report` désactivé (410).
- **Seed** : exécutable dans l'image migrator (`tsx`).
- **Rate-limit CV Checker** : IP lue uniquement dans `X-Real-Ip` (écrasé par Traefik), réservation
  atomique en base (`03_cv_rate_limit.sql`), plafond global `CV_ANALYSIS_GLOBAL_DAILY_LIMIT`.
- **Image Docker** : `pdf-parse`, `pdfjs-dist` et `@napi-rs/canvas` copiés explicitement (le traçage
  standalone les omettait : l'extraction PDF échouait en prod).
