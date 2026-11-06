-- Parcours de commande court (/commander) :
--   - email client OPTIONNEL (pas d'email = pas d'email Resend client) ;
--   - a_un_cv : le client a-t-il fourni un CV ? (NULL pour les commandes antérieures) ;
--   - cv_fichier : chemin du CV dans Supabase Storage (bucket privé "commandes-cv").
-- Non destructif : aucune colonne supprimée, aucune donnée modifiée. Les champs
-- du brief (secteur, poste, expérience…) restent dans "details" (JSON, optionnel).
-- RLS déjà actif sur "commandes" (1_enable_rls) : rien à ajouter.

ALTER TABLE "commandes" ADD COLUMN "a_un_cv" BOOLEAN,
ADD COLUMN "cv_fichier" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

CREATE INDEX "commandes_a_un_cv_idx" ON "commandes"("a_un_cv");
