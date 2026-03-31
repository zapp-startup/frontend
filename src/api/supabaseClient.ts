import { createClient } from "@supabase/supabase-js";
import { getValidatedUrlOrThrow, resolveSupabaseUrl } from "@/config/apiEnv";


const supabaseUrl = getValidatedUrlOrThrow(resolveSupabaseUrl());
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);
