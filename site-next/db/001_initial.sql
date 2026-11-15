-- PostgreSQL / Neon : migration de création non destructive
-- Ne supprime ni ne remplace les données de l'ancien site PHP/MySQL.
CREATE TABLE IF NOT EXISTS public.catalogue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('service','formation','logiciel','projet','actualite')),
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detail TEXT,
  status TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS catalogue_items_type_idx ON public.catalogue_items (type, published, sort_order);
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS contact_messages_date_idx ON public.contact_messages (created_at DESC);
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  fingerprint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (fingerprint, window_start)
);
CREATE INDEX IF NOT EXISTS contact_rate_limits_cleanup_idx ON public.contact_rate_limits (window_start);
-- Prévoir une tâche d'entretien purgeant les anciennes fenêtres de plus de 48 heures.
