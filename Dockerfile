# syntax=docker/dockerfile:1.7
# =============================================================
# CVPro225 — image de production (Next.js standalone)
#   build  : docker build -t cvpro225 --build-arg NEXT_PUBLIC_...=... .
#   migrer : docker build --target migrator -t cvpro225-migrator .
# =============================================================

ARG NODE_VERSION=20-bookworm-slim

# ---------- 1. deps : node_modules complets (cache npm) ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---------- 2. builder : prisma generate + next build ----------
FROM deps AS builder
WORKDIR /app

# Variables publiques : intégrées au bundle JS au moment du build.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_WHATSAPP
ARG NEXT_PUBLIC_EMAIL
ARG NEXT_PUBLIC_STRAPI_URL=
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_WHATSAPP=$NEXT_PUBLIC_WHATSAPP \
    NEXT_PUBLIC_EMAIL=$NEXT_PUBLIC_EMAIL \
    NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL \
    NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN npx prisma generate && npm run build

# ---------- 3. migrator : one-shot `prisma migrate deploy` ----------
FROM deps AS migrator
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["npx", "--no-install", "prisma", "migrate", "deploy"]

# ---------- 4. runner : image finale minimale ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Utilisateur non-root
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# pdf-parse / pdfjs-dist (externes, cf. next.config) chargent dynamiquement
# pdf.worker.mjs et @napi-rs/canvas (DOMMatrix…) : le traçage standalone ne les
# voit pas -> sans ces copies, l'extraction PDF du CV Checker échoue en prod.
# Le binaire canvas de la bonne architecture a été installé par `npm ci` (étape deps).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pdf-parse  ./node_modules/pdf-parse
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pdfjs-dist ./node_modules/pdfjs-dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@napi-rs   ./node_modules/@napi-rs

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
