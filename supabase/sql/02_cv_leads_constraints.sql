-- =============================================================
-- 02_cv_leads_constraints.sql — à exécuter MANUELLEMENT (éditeur SQL Supabase)
--
-- Problème : PRIMARY KEY (id, email, report_sent). `id` étant une identité
-- déjà unique, cette PK ne garantit rien sur l'email : un même lead peut être
-- inséré N fois (double soumission, requêtes concurrentes, ancien /api/cv-report).
--
-- Cible : PK (id) seule + UNIQUE (email) + email toujours en minuscules.
-- Le code fait désormais un upsert ON CONFLICT (email).
--
-- ÉTAPE 1 (lecture seule) : mesurer les doublons AVANT de lancer l'étape 2.
-- ÉTAPE 2 (écriture, transactionnelle) : sauvegarde + fusion des doublons + contraintes.
-- =============================================================


-- ---------------------------------------------------------------
-- ÉTAPE 1 — DIAGNOSTIC (lecture seule)
-- ---------------------------------------------------------------
SELECT count(*) AS lignes, count(DISTINCT lower(trim(email))) AS leads_distincts
FROM public.cv_leads;

SELECT lower(trim(email)) AS email, count(*) AS n,
       min(created_at) AS premier, max(created_at) AS dernier,
       bool_or(coalesce(contacted, false)) AS contacte,
       count(notes) FILTER (WHERE trim(notes) <> '') AS avec_notes
FROM public.cv_leads
GROUP BY 1 HAVING count(*) > 1
ORDER BY n DESC, dernier DESC
LIMIT 50;


-- ---------------------------------------------------------------
-- ÉTAPE 2 — CORRECTION (une seule transaction ; tout ou rien)
-- ---------------------------------------------------------------
BEGIN;

-- Empêche toute écriture concurrente pendant la fusion
LOCK TABLE public.cv_leads IN SHARE ROW EXCLUSIVE MODE;

-- 2.1 Sauvegarde complète, hors du schéma exposé par l'API
CREATE SCHEMA IF NOT EXISTS backup;
REVOKE ALL ON SCHEMA backup FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON SCHEMA backup FROM anon, authenticated';
  END IF;
END $$;
CREATE TABLE backup.cv_leads_20261105 AS TABLE public.cv_leads;

-- 2.2 Pour chaque email : on garde la ligne la PLUS RÉCENTE (dernière analyse),
--     en lui reportant le premier contact, le suivi CRM et les notes des doublons.
CREATE TEMP TABLE cv_leads_merge ON COMMIT DROP AS
SELECT id,
       lower(trim(email)) AS email_norm,
       row_number()      OVER w_ord AS rn,
       min(created_at)   OVER w     AS first_seen,
       bool_or(coalesce(contacted, false)) OVER w AS any_contacted,
       bool_or(report_sent) OVER w  AS any_report_sent,
       max(first_name)      OVER w  AS some_first_name,
       max(whatsapp_number) OVER w  AS some_whatsapp,
       string_agg(nullif(trim(notes), ''), E'\n---\n') OVER w AS all_notes
FROM public.cv_leads
WINDOW w     AS (PARTITION BY lower(trim(email))),
       w_ord AS (PARTITION BY lower(trim(email)) ORDER BY created_at DESC, id DESC);

UPDATE public.cv_leads l
SET email           = m.email_norm,
    created_at      = m.first_seen,
    contacted       = m.any_contacted,
    report_sent     = m.any_report_sent,
    first_name      = coalesce(l.first_name, m.some_first_name),
    whatsapp_number = coalesce(l.whatsapp_number, m.some_whatsapp),
    notes           = m.all_notes
FROM cv_leads_merge m
WHERE l.id = m.id AND m.rn = 1;

DELETE FROM public.cv_leads l
USING cv_leads_merge m
WHERE l.id = m.id AND m.rn > 1;

-- 2.3 Contraintes
ALTER TABLE public.cv_leads DROP CONSTRAINT cv_leads_pkey;
ALTER TABLE public.cv_leads ADD  CONSTRAINT cv_leads_pkey PRIMARY KEY (id);
ALTER TABLE public.cv_leads ADD  CONSTRAINT cv_leads_email_key UNIQUE (email);
ALTER TABLE public.cv_leads ADD  CONSTRAINT cv_leads_email_lowercase CHECK (email = lower(btrim(email)));

COMMIT;


-- ---------------------------------------------------------------
-- VÉRIFICATIONS (lecture seule)
-- ---------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid IN ('public.cv_leads'::regclass, 'public.cv_analyses_log'::regclass)
ORDER BY conrelid::regclass::text, conname;

SELECT (SELECT count(*) FROM public.cv_leads)           AS lignes_apres,
       (SELECT count(*) FROM backup.cv_leads_20261105)  AS lignes_sauvegardees;

-- cv_analyses_log : PK (id) seule, déjà correcte. Pas de UNIQUE pertinent :
-- c'est un journal (1 ligne par analyse réellement facturée par l'API IA,
-- utilisée pour le rate-limit par IP). Aucune modification nécessaire.

-- Après vérification (quelques jours) : DROP SCHEMA backup CASCADE;  (cf. DEPLOY.md C2)
