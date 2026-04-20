import "@supabase/functions-js/edge-runtime.d.ts";
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

function getServiceSupabaseClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }

    const { student_id, session_id, scanned_token } = await req.json().catch(
      () => ({}),
    );

    if (!student_id || !session_id || !scanned_token) {
      return jsonResponse(
        { error: "student_id, session_id, and scanned_token are required" },
        { status: 400 },
      );
    }

    const supabase = getServiceSupabaseClient();

    const { data: session, error: sessionError } = await supabase
      .from("attendance_sessions")
      .select("id, expires_at, qr_token_secret")
      .eq("id", session_id)
      .maybeSingle();

    if (sessionError) {
      return jsonResponse({ error: sessionError.message }, { status: 500 });
    }
    if (!session) {
      return jsonResponse({ error: "Session not found" }, { status: 404 });
    }

    const expiresAt = new Date(session.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      return jsonResponse({ error: "Session expired" }, { status: 400 });
    }

    if (scanned_token !== session.qr_token_secret) {
      return jsonResponse({ error: "Invalid QR token" }, { status: 401 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("attendance_logs")
      .select("id")
      .eq("session_id", session_id)
      .eq("student_id", student_id)
      .maybeSingle();

    if (existingError) {
      return jsonResponse({ error: existingError.message }, { status: 500 });
    }
    if (existing) {
      return jsonResponse(
        { success: true, message: "Attendance already marked" },
        { status: 200 },
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("attendance_logs")
      .insert({
        session_id,
        student_id,
        status: "present",
      })
      .select("id")
      .single();

    if (insertError) {
      return jsonResponse({ error: insertError.message }, { status: 500 });
    }

    return jsonResponse(
      { success: true, attendance_log_id: inserted.id },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/mark-attendance' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
