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

-- La table d'historique Prisma est aussi exposée par défaut : RLS sans policy.
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;
