import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Default URL/key for Supabase CLI local dev (`supabase start` → http://127.0.0.1:54321).
 * In development, if env vars are missing or incomplete, we use these so the bundle loads
 * (avoids a white screen). Use frontend/.env for a hosted Supabase project.
 */
const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";
const LOCAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

function resolveSupabaseConfig(): { url: string; anonKey: string } {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

  if (url && anonKey) {
    return { url, anonKey };
  }

  if (import.meta.env.DEV) {
    if (url || anonKey) {
      console.warn(
        "[Zapp] Incomplete VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — using local Supabase CLI defaults. " +
          "Set both in frontend/.env for a hosted project."
      );
    } else {
      console.warn(
        "[Zapp] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — using local Supabase CLI defaults."
      );
    }
    return { url: LOCAL_SUPABASE_URL, anonKey: LOCAL_SUPABASE_ANON_KEY };
  }

  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. See frontend/.env.example."
  );
}

const { url: supabaseUrl, anonKey: supabaseKey } = resolveSupabaseConfig();

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
