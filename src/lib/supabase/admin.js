import { createClient } from "@supabase/supabase-js";

// Hanya digunakan di server-side! Pastikan SUPABASE_SERVICE_ROLE_KEY tidak pernah expose ke client/browser.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
