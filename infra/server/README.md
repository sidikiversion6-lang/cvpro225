# Serveur CVPro225 — préparation & checklist `.env`

## 1. Préparer le VPS (une fois, en root)

```bash
scp infra/server/setup.sh root@IP_DU_SERVEUR:/root/
ssh root@IP_DU_SERVEUR 'DEPLOY_PUBKEY="$(cat ~/.ssh/authorized_keys | head -1)" bash /root/setup.sh'
# ou, en passant ta clé locale :
ssh root@IP_DU_SERVEUR "DEPLOY_PUBKEY='$(cat ~/.ssh/id_ed25519.pub)' bash /root/setup.sh"
```

Le script : MAJ système + MAJ sécurité auto, utilisateur `deploy` (groupes `sudo`, `docker`),
UFW (22 limité, 80, 443), fail2ban, Docker Engine + Compose (dépôt officiel), rotation des
logs Docker, réseau `web`, dossier `/srv/cvpro225`, swap 2 Go si RAM < 4 Go, durcissement
SSH (root et mots de passe désactivés) **uniquement si** une clé valide est installée.

Toujours dans la session root, définir le mot de passe sudo : `passwd deploy`.

**⚠️ AVANT DE FERMER LA SESSION ROOT : dans un SECOND terminal, vérifier
`ssh deploy@IP_DU_SERVEUR` puis `sudo -v` (doit demander le mot de passe et réussir)
et `docker ps` (doit fonctionner sans sudo). Si l'un échoue, corriger depuis la
session root encore ouverte : après le durcissement SSH, root ne peut plus se
connecter.**

> Le groupe `docker` équivaut à un accès root. Ne pas y ajouter d'autres utilisateurs.
> Docker contourne UFW pour les ports publiés : seul Traefik publie des ports (80/443).

## 2. Checklist — `/srv/cvpro225/.env` (app)

Créer à partir de `.env.example`, puis `chmod 600 .env`. 🔨 = lue **au build** :
toute modification impose un rebuild (`docker compose up -d --build`).

| ✓ | Variable | Valeur / où la trouver |
|---|---|---|
| ☐ | 🔨 `NEXT_PUBLIC_APP_URL` | `https://cvpro225.com` (sans `/` final) |
| ☐ | 🔨 `NEXT_PUBLIC_WHATSAPP` | numéro affiché sur le site |
| ☐ | 🔨 `NEXT_PUBLIC_EMAIL` | `contact@cvpro225.com` |
| ☐ | 🔨 `NEXT_PUBLIC_STRAPI_URL` | optionnel, vide sinon |
| ☐ | `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| ☐ | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (**secrète**, serveur uniquement, jamais en `NEXT_PUBLIC_`) |
| ☐ | `AUTH_SECRET` | **nouvelle** valeur prod : `openssl rand -base64 32` (≠ dev). La changer déconnecte tout le monde |
| ☐ | `AUTH_TRUST_HOST` | `true` |
| ☐ | `NEXTAUTH_URL` | `https://cvpro225.com` |
| ☐ | `DATABASE_URL` | Supabase → Connect → **Transaction pooler** (port **6543**) + `?pgbouncer=true&connection_limit=1`. Mot de passe **URL-encodé** si caractères spéciaux |
| ☐ | `DIRECT_URL` | Supabase → Connect → **Session pooler** (port **5432**). Préférer le pooler à `db.<ref>.supabase.co`, joignable seulement en IPv6 sans l'add-on IPv4 |
| ☐ | `RESEND_API_KEY` | Resend → API Keys (droits *Sending access*). Le domaine `cvpro225.com` doit être **vérifié** dans Resend (SPF/DKIM), l'expéditeur étant `noreply@cvpro225.com` |
| ☐ | `ADMIN_EMAIL` | destinataire des notifications admin |
| ☐ | `ADMIN_BCC_EMAIL` | copie cachée (optionnel) |
| ☐ | `PAYDUNYA_MASTER_KEY` / `PRIVATE_KEY` / `TOKEN` | PayDunya → Intégrer l'API → clés **du mode choisi** (test ≠ live) |
| ☐ | `PAYDUNYA_MODE` | `test` d'abord ; `live` après un paiement de bout en bout validé |
| ☐ | `PAYDUNYA_WEBHOOK_URL` | `https://cvpro225.com/api/webhooks/paydunya` |
| ☐ | `ANTHROPIC_API_KEY` | console Anthropic → clé dédiée prod (plafond de dépenses conseillé) |
| ☐ | `STRAPI_URL`, `STRAPI_API_TOKEN`, `GOOGLE_VERIFICATION` | optionnels |
| — | `SEED_ADMIN_PASSWORD` | **inutile sur le serveur** (seed seulement, ≥ 12 caractères) |

## 3. Checklist — `/srv/cvpro225/infra/traefik/.env`

| ✓ | Variable | Valeur |
|---|---|---|
| ☐ | `ACME_EMAIL` | adresse **réelle** (Let's Encrypt refuse `example.com` & co) |
| ☐ | `ACME_CA_SERVER` / `ACME_STORAGE` | laisser **commentées** (staging) au 1er démarrage, décommenter une fois les certificats staging obtenus |
| ☐ | `TRAEFIK_LOG_LEVEL` | `INFO` (`DEBUG` pour diagnostiquer) |

Fichiers ACME (une fois) :

```bash
cd /srv/cvpro225/infra/traefik
install -m 600 /dev/null letsencrypt/acme.json
install -m 600 /dev/null letsencrypt/acme-staging.json
```

## 4. Vérifications avant mise en ligne

- ☐ `dig +short cvpro225.com` et `dig +short www.cvpro225.com` → IP du serveur (pas d'AAAA vers une autre machine)
- ☐ Aucun fichier `.env` dans `git status` / `git ls-files`
- ☐ `chmod 600` sur les deux `.env` et les `acme*.json`
