import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Cliente Supabase con service_role.
 * Solo para Server Actions / Route Handlers (crear o eliminar usuarios).
 * NUNCA exponer al navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    )
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
