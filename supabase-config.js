window.LRL_SUPABASE_CONFIG = {
  projectUrl: "https://tjcvlmlweflgmbgnpbmm.supabase.co",
  anonKey: "PLAK_HIER_DE_SLEUTEL_DIE_JE_NET_STUURDE"
};

window.LRL_SUPABASE_READY = function () {
  const config = window.LRL_SUPABASE_CONFIG || {};
  return Boolean(
    config.projectUrl &&
    config.anonKey &&
    !config.projectUrl.includes("PASTE_") &&
    !config.anonKey.includes("PASTE_")
  );
};

window.getLRLSupabase = function () {
  if (!window.LRL_SUPABASE_READY() || !window.supabase) {
    return null;
  }

  if (!window.__LRL_SUPABASE_CLIENT__) {
    window.__LRL_SUPABASE_CLIENT__ = window.supabase.createClient(
      window.LRL_SUPABASE_CONFIG.projectUrl,
      window.LRL_SUPABASE_CONFIG.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }

  return window.__LRL_SUPABASE_CLIENT__;
};
