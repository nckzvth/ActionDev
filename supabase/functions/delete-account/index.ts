import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://nckzvth.github.io",
]);

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") ?? "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://nckzvth.github.io",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  const authorization = request.headers.get("authorization");
  if (!authorization) return Response.json({ error: "Authentication required" }, { status: 401, headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !publishableKey || !secretKey) return Response.json({ error: "Function configuration is incomplete" }, { status: 500, headers: corsHeaders });

  const userClient = createClient(url, publishableKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return Response.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders });

  const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return Response.json({ error: "Account deletion failed" }, { status: 500, headers: corsHeaders });

  return Response.json({ deleted: true }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
