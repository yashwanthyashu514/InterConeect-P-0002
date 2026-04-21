import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: unknown,
  init?: Omit<ResponseInit, "headers"> & { headers?: Record<string, string> },
) {
  const headers = {
    ...corsHeaders,
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };
  return new Response(JSON.stringify(body), { ...init, headers });
}

function getEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing ${name} environment variable.`);
  return v;
}

function getServiceSupabaseClient() {
  const url = getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getAuthSupabaseClient(req: Request) {
  const url = getEnv("SUPABASE_URL");
  const anonKey = getEnv("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }

    const authClient = getAuthSupabaseClient(req);
    const { data, error } = await authClient.auth.getUser();
    if (error) return jsonResponse({ error: error.message }, { status: 401 });
    const user = data.user;
    if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });

    const nameRaw =
      (user.user_metadata?.name as string | undefined) ??
      (user.user_metadata?.full_name as string | undefined) ??
      "";
    const name =
      typeof nameRaw === "string" && nameRaw.trim()
        ? nameRaw.trim()
        : (user.email?.split("@")[0] ?? "Student");

    const service = getServiceSupabaseClient();

    // Ensure profile exists. Default role is student.
    const { data: upserted, error: upsertError } = await service
      .from("users")
      .upsert(
        {
          id: user.id,
          name,
          email: user.email,
          role: "student",
        },
        { onConflict: "id" },
      )
      .select("id, role")
      .single();

    if (upsertError) {
      return jsonResponse({ error: upsertError.message }, { status: 500 });
    }

    return jsonResponse(
      { success: true, id: upserted.id, role: upserted.role },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, { status: 500 });
  }
});

