-- =============================================================
-- 1_enable_rls — verrouille les tables Prisma vis-à-vis de l'API Supabase
--
-- Contexte : sur Supabase, toute table de `public` est exposée par l'API REST
-- (PostgREST) aux rôles `anon` et `authenticated`, dont la clé est publique.
-- L'application n'accède à ces tables QUE via Prisma (rôle `postgres`,
-- propriétaire des tables, donc non soumis à RLS sans FORCE) : on active RLS
-- SANS aucune policy (= tout refusé pour anon/authenticated) et on retire en
-- plus leurs privilèges (défense en profondeur).
--
-- Les blocs REVOKE sont conditionnels : la migration reste applicable sur un
-- Postgres sans les rôles Supabase (dev local, CI).
-- =============================================================

ALTER TABLE "User"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commandes"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_configs"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "packs"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pack_features"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_configs"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages"          ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r text;
  t text;
  tables text[] := ARRAY[
    'User', 'Account', 'Session', 'VerificationToken', 'commandes',
    'service_configs', 'packs', 'pack_features', 'site_configs',
    'notifications', 'messages', '_prisma_migrations'
  ];
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      FOREACH t IN ARRAY tables LOOP
        IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
          EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', t, r);
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Séquences liées à ces tables (colonnes serial/identity) : aucune aujourd'hui
-- (identifiants cuid), boucle générique pour les futures colonnes autoincrement.
DO $$
DECLARE
  r text;
  seq regclass;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      FOR seq IN
        SELECT DISTINCT d.objid::regclass
        FROM pg_depend d
        JOIN pg_class s ON s.oid = d.objid AND s.relkind = 'S'
        JOIN pg_class t ON t.oid = d.refobjid
        WHERE d.deptype IN ('a', 'i')
          AND t.relnamespace = 'public'::regnamespace
          AND t.relname IN ('User', 'Account', 'Session', 'VerificationToken', 'commandes',
                            'service_configs', 'packs', 'pack_features', 'site_configs',
                            'notifications', 'messages', '_prisma_migrations')
      LOOP
        EXECUTE format('REVOKE ALL ON SEQUENCE %s FROM %I', seq, r);
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Privilèges par défaut : le rôle qui exécute les migrations (= celui qui crée
-- les tables Prisma, `postgres` sur Supabase) n'accordera plus rien à
-- anon/authenticated sur ses FUTURES tables et séquences de `public`.
-- Annule le `GRANT ALL ... TO anon, authenticated` posé par Supabase pour ce rôle.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated', current_user);
    EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated', current_user);
  END IF;
END $$;

-- La table d'historique Prisma est aussi exposée par défaut : RLS sans policy.
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;
