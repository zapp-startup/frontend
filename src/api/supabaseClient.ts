import { createClient } from "@supabase/supabase-js";
import { getValidatedUrlOrThrow, resolveSupabaseUrl } from "@/config/apiEnv";


const supabaseUrl = getValidatedUrlOrThrow(resolveSupabaseUrl());
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Keep browser sessions in memory only. This reduces token exposure from
    // persistent localStorage at the cost of requiring re-auth on full reload.
    persistSession: false,
  },
});
