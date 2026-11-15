-- Extension administrative non destructive de la préproduction PostgreSQL JP-SERVICES.
-- A exécuter après 001_initial.sql. Les données PHP/MySQL historiques ne sont pas concernées.
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON public.admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS public.admin_login_limits (
  fingerprint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (fingerprint, window_start)
);
CREATE INDEX IF NOT EXISTS admin_login_limits_cleanup_idx ON public.admin_login_limits (window_start);
-- Entretien périodique : effacer les sessions expirées et les limites >24 heures.
-- DELETE FROM public.admin_sessions WHERE expires_at < now();
-- DELETE FROM public.admin_login_limits WHERE window_start < now() - interval '24 hours';
-- Aucun mot de passe administrateur n'est stocké dans PostgreSQL ;
-- son empreinte PBKDF2 et le secret de signature résident exclusivement dans les secrets hébergeur.
