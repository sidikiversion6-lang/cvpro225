-- =============================================================
-- 03_cv_rate_limit.sql — à exécuter MANUELLEMENT (éditeur SQL Supabase)
--
-- Rate-limit ATOMIQUE du CV Checker (remplace le "vérifier puis agir") :
-- une seule fonction compte ET réserve dans la même transaction, sous un
-- verrou consultatif : N requêtes simultanées ne peuvent pas toutes passer.
--
--   - plafond par IP     (p_ip_limit     analyses / fenêtre glissante)
--   - plafond GLOBAL     (p_global_limit analyses / fenêtre, toutes IP confondues)
--
-- La ligne réservée (completed=false) est complétée après l'analyse IA
-- (score, secteur… completed=true) ou supprimée si l'appel IA échoue.
--
-- Appelée uniquement par le serveur (service_role) via supabase-js .rpc().
-- Prérequis : 01_cv_tables_access.sql appliqué.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.cv_reserve_analysis(
  p_ip            text,
  p_ip_limit      integer,
  p_global_limit  integer,
  p_window_hours  integer DEFAULT 24
)
RETURNS TABLE (allowed boolean, reason text, analysis_id bigint)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_since  timestamptz := clock_timestamp() - make_interval(hours => p_window_hours);
  v_global integer;
  v_ip     integer;
  v_id     bigint;
BEGIN
  IF p_ip IS NULL OR btrim(p_ip) = '' THEN
    RAISE EXCEPTION 'cv_reserve_analysis: p_ip requis';
  END IF;
  IF p_ip_limit < 0 OR p_global_limit < 0 OR p_window_hours <= 0 THEN
    RAISE EXCEPTION 'cv_reserve_analysis: limites invalides';
  END IF;

  -- Sérialise les réservations (volume faible) : comptage + insertion atomiques.
  -- Verrou libéré automatiquement à la fin de la transaction.
  PERFORM pg_advisory_xact_lock(hashtext('cv_reserve_analysis'));

  SELECT count(*) INTO v_global
  FROM cv_analyses_log
  WHERE created_at >= v_since;
  IF v_global >= p_global_limit THEN
    RETURN QUERY SELECT false, 'global_limit'::text, NULL::bigint;
    RETURN;
  END IF;

  SELECT count(*) INTO v_ip
  FROM cv_analyses_log
  WHERE ip_address = p_ip AND created_at >= v_since;
  IF v_ip >= p_ip_limit THEN
    RETURN QUERY SELECT false, 'ip_limit'::text, NULL::bigint;
    RETURN;
  END IF;

  INSERT INTO cv_analyses_log (ip_address, created_at, completed)
  VALUES (p_ip, clock_timestamp(), false)
  RETURNING id INTO v_id;

  RETURN QUERY SELECT true, 'ok'::text, v_id;
END;
$$;

-- Exposée par l'API REST (RPC) : seul le serveur peut l'appeler.
REVOKE ALL     ON FUNCTION public.cv_reserve_analysis(text, integer, integer, integer) FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.cv_reserve_analysis(text, integer, integer, integer) FROM anon, authenticated';
  END IF;
END $$;
GRANT  EXECUTE ON FUNCTION public.cv_reserve_analysis(text, integer, integer, integer) TO service_role;

-- Comptage global sur fenêtre glissante
CREATE INDEX IF NOT EXISTS idx_analyses_log_created_at
  ON public.cv_analyses_log (created_at DESC);

COMMIT;

-- Vérification (lecture seule) — attendu : seul service_role (et postgres) ont EXECUTE
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public' AND routine_name = 'cv_reserve_analysis'
ORDER BY grantee;
