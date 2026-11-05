-- =============================================================
-- 01_cv_tables_access.sql — à exécuter MANUELLEMENT (éditeur SQL Supabase)
--
-- cv_leads et cv_analyses_log ne sont lues/écrites QUE côté serveur
-- (routes /api/cv-analyze, /api/cv-report via lib/cv-checker/*), désormais
-- avec la clé service_role. Aucun accès navigateur. Donc :
--   - anon / authenticated : AUCUN droit (ni INSERT, ni SELECT, ni UPDATE)
--   - service_role : lecture/écriture (contourne RLS)
--   - RLS activé, aucune policy
--
-- Prérequis : la version de l'app utilisant SUPABASE_SERVICE_ROLE_KEY est
-- déployée (sinon l'outil CV Checker cesse d'enregistrer les analyses).
-- =============================================================

BEGIN;

-- 1. Supprimer TOUTES les policies existantes sur ces deux tables
--    (celles du dump + d'éventuelles policies créées depuis le dashboard)
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('cv_leads', 'cv_analyses_log')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

-- 2. RLS actif (déjà le cas, idempotent)
ALTER TABLE public.cv_leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_analyses_log ENABLE ROW LEVEL SECURITY;

-- 3. Retirer tout privilège aux rôles exposés par l'API publique
REVOKE ALL ON TABLE    public.cv_leads, public.cv_analyses_log           FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.cv_leads_id_seq, public.cv_analyses_log_id_seq FROM anon, authenticated;

-- 4. Droits explicites du serveur
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cv_leads, public.cv_analyses_log TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.cv_leads_id_seq, public.cv_analyses_log_id_seq TO service_role;

COMMIT;

-- -------------------------------------------------------------
-- Vérifications (lecture seule) — attendu : 0 policy ; anon/authenticated absents
-- -------------------------------------------------------------
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('cv_leads', 'cv_analyses_log');

SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name IN ('cv_leads', 'cv_analyses_log')
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY table_name, grantee ORDER BY table_name, grantee;

-- -------------------------------------------------------------
-- OPTIONNEL (recommandé) : ne plus accorder automatiquement anon/authenticated
-- sur les FUTURES tables créées par postgres dans public (Prisma, dashboard).
-- À ne pas appliquer si tu prévois des tables lues directement par le navigateur.
-- -------------------------------------------------------------
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
