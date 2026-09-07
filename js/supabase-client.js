/**
-- =============================================================================
-- IEANJESÚS MALDONADO — CLIENTE OFICIAL DE SUPABASE
-- =============================================================================
-- Configuración centralizada del cliente frontend de Supabase.
-- Utiliza la URL del proyecto y la Publishable Key pública autorizada.
-- =============================================================================
*/

const SUPABASE_PROJECT_URL = 'https://voaitpfwelisdflspuyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Tq-mPa_EAL9wGBg-lX8FvA_ccs2eH6A';

// Inicializar cliente Supabase cuando el script oficial esté cargado
if (typeof supabase !== 'undefined') {
  window.supabaseClient = supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} else {
  console.warn('El SDK de Supabase aún no se ha cargado en el documento.');
}
