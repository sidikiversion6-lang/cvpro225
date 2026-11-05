-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "telephone" TEXT,
    "ville" TEXT,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'client',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "pack" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "ville" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'pending',
    "mode_paiement" TEXT,
    "montant" INTEGER NOT NULL,
    "details" JSONB,
    "message" TEXT,
    "paydunya_token" TEXT,
    "paydunya_status" TEXT,
    "paid_at" TIMESTAMP(3),
    "livraison_url" TEXT,
    "livraison_note" TEXT,
    "delivered_at" TIMESTAMP(3),
    "userId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_configs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" INTEGER NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'GNF',
    "delai" TEXT NOT NULL,
    "recommande" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "serviceId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_features" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "inclus" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "packId" TEXT NOT NULL,

    CONSTRAINT "pack_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_configs" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "groupe" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "lien" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_ref_key" ON "commandes"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_paydunya_token_key" ON "commandes"("paydunya_token");

-- CreateIndex
CREATE INDEX "commandes_email_idx" ON "commandes"("email");

-- CreateIndex
CREATE INDEX "commandes_statut_idx" ON "commandes"("statut");

-- CreateIndex
CREATE INDEX "commandes_service_idx" ON "commandes"("service");

-- CreateIndex
CREATE INDEX "commandes_userId_idx" ON "commandes"("userId");

-- CreateIndex
CREATE INDEX "commandes_paydunya_token_idx" ON "commandes"("paydunya_token");

-- CreateIndex
CREATE UNIQUE INDEX "service_configs_slug_key" ON "service_configs"("slug");

-- CreateIndex
CREATE INDEX "packs_serviceId_idx" ON "packs"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "packs_serviceId_slug_key" ON "packs"("serviceId", "slug");

-- CreateIndex
CREATE INDEX "pack_features_packId_idx" ON "pack_features"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "site_configs_cle_key" ON "site_configs"("cle");

-- CreateIndex
CREATE INDEX "messages_commandeId_idx" ON "messages"("commandeId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packs" ADD CONSTRAINT "packs_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_features" ADD CONSTRAINT "pack_features_packId_fkey" FOREIGN KEY ("packId") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

