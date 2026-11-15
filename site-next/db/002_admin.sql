-- Extension administrative non destructive de la préproduction PostgreSQL JP-SERVICES.
-- A exécuter après 001_initial.sql. Les données PHP/MySQL historiques ne sont pas concernées.
CREATE TABLE IF NOT EXISTS public.admin_login_limits (
  fingerprint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (fingerprint, window_start)
);
CREATE INDEX IF NOT EXISTS admin_login_limits_cleanup_idx ON public.admin_login_limits (window_start);
-- Entretien périodique à prévoir : effacer les fenêtres de plus de 24 heures.
-- Aucun mot de passe administrateur n'est stocké dans PostgreSQL ;
-- son empreinte PBKDF2 et le secret de signature résident exclusivement dans les secrets hébergeur.
