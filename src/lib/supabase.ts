import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(url!, publishableKey!, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const productionSiteUrl = "https://nckzvth.github.io/ActionDev/";

export function getAuthRedirectUrl() {
  const base = import.meta.env.BASE_URL || "/";
  return new URL(base, window.location.origin).toString();
}

