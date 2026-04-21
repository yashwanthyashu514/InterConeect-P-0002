"use client";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  if (
    lower.includes("invalid login") ||
    lower.includes("invalid credentials")
  ) {
    return "Invalid credentials.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

function extractErrorMessage(err: unknown): string | null {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState<"student" | "faculty">("student");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function writeAuthCookie(role: string, userId: string) {
    document.cookie = `cc_auth=${encodeURIComponent(
      JSON.stringify({ role, userId }),
    )}; Path=/; Max-Age=2592000; SameSite=Lax`;
  }

  function clearAuthCookie() {
    document.cookie = "cc_auth=; Path=/; Max-Age=0; SameSite=Lax";
  }

  async function handleSendResetLink() {
    setResetMessage(null);
    setError(null);
    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
      return;
    }
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email above, then click Send reset link.");
      return;
    }
    setResetSending(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmed,
        { redirectTo: `${origin}/reset-password` },
      );
      if (resetError) throw resetError;
      setResetMessage(
        "If an account exists for that email, you will receive a reset link shortly. Check your inbox and spam folder.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send reset email.",
      );
    } finally {
      setResetSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        },
      );

      if (signInError) {
        setError(formatAuthError(signInError.message));
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Invalid credentials.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        try {
          const fallbackName =
            (typeof user.user_metadata?.name === "string" &&
              user.user_metadata.name.trim()) ||
            (typeof user.user_metadata?.full_name === "string" &&
              user.user_metadata.full_name.trim()) ||
            (user.email?.split("@")[0] ?? "Student");
          const { error: upsertError } = await supabase.from("users").upsert(
            {
              id: user.id,
              name: fallbackName,
              email: user.email ?? email.trim(),
              role: "student",
            },
            { onConflict: "id" },
          );
          if (upsertError) throw upsertError;

          const { data: profile2, error: profileError2 } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          if (profileError2 || !profile2) {
            throw new Error(
              profileError2?.message ??
                "Profile still missing. Check RLS policies and migrations.",
            );
          }
          const role2 = profile2.role as string;
          if (role2 === "student" || role2 === "faculty") {
            if (portal === "faculty" && role2 !== "faculty") {
              clearAuthCookie();
              await supabase.auth.signOut();
              setError("You do not have faculty permissions.");
              setLoading(false);
              return;
            }
            if (portal === "student" && role2 === "faculty") {
              clearAuthCookie();
              await supabase.auth.signOut();
              setError("Please use the Faculty portal to sign in.");
              setLoading(false);
              return;
            }
            writeAuthCookie(role2, user.id);
            router.replace(
              role2 === "faculty" ? "/faculty/dashboard" : "/student/dashboard",
            );
            return;
          }
          if (role2 === "admin") {
            writeAuthCookie(role2, user.id);
            router.replace("/admin/users");
            return;
          }
          clearAuthCookie();
          await supabase.auth.signOut();
          setError("This portal is only for faculty, student, and admin accounts.");
          setLoading(false);
          return;
        } catch (upsertOrReloadError) {
          clearAuthCookie();
          await supabase.auth.signOut();
          const upsertMessage = extractErrorMessage(upsertOrReloadError);
          setError(
            upsertMessage
              ? `Profile could not be loaded: ${upsertMessage}. If this is an RLS issue, run SQL: create policy "users_insert_own" on public.users for insert to authenticated with check (id = auth.uid());`
              : profileError?.message
                ? `Profile could not be loaded: ${profileError.message}`
                : "Your profile could not be loaded. Please contact an administrator.",
          );
          setLoading(false);
          return;
        }
      }

      const role = profile.role as string;
      if (role === "student" || role === "faculty") {
        if (portal === "faculty" && role !== "faculty") {
          clearAuthCookie();
          await supabase.auth.signOut();
          setError("You do not have faculty permissions.");
          setLoading(false);
          return;
        }
        if (portal === "student" && role === "faculty") {
          clearAuthCookie();
          await supabase.auth.signOut();
          setError("Please use the Faculty portal to sign in.");
          setLoading(false);
          return;
        }
        writeAuthCookie(role, user.id);
        router.replace(
          role === "faculty" ? "/faculty/dashboard" : "/student/dashboard",
        );
        return;
      }
      if (role === "admin") {
        writeAuthCookie(role, user.id);
        router.replace("/admin/users");
        return;
      }

      clearAuthCookie();
      await supabase.auth.signOut();
      setError("This portal is only for faculty, student, and admin accounts.");
    } catch {
      clearAuthCookie();
      setError("Failed to connect to database. Please use static login.");
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-12 font-sans dark:bg-zinc-950 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Campus Connect
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in with your school email
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl shadow-zinc-200/40 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/40 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="portal"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Portal
              </label>
              <select
                id="portal"
                name="portal"
                value={portal}
                onChange={(e) =>
                  setPortal(e.target.value as "student" | "faculty")
                }
                className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                suppressHydrationWarning
              >
                <option value="student">Student portal</option>
                <option value="faculty">Faculty portal</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                placeholder="you@school.edu"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen((v) => !v);
                    setResetMessage(null);
                    setError(null);
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                placeholder="••••••••"
                suppressHydrationWarning
              />
            </div>

            {forgotOpen ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  We will email a reset link to the address you entered above.
                  Add{" "}
                  <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">
                    /reset-password
                  </code>{" "}
                  to Supabase Auth redirect URLs if emails do not arrive.
                </p>
                <button
                  type="button"
                  onClick={() => void handleSendResetLink()}
                  disabled={resetSending}
                  className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetSending ? "Sending…" : "Send reset link"}
                </button>
                <p className="mt-2 text-center text-xs text-zinc-500">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open dedicated reset page
                  </Link>
                </p>
              </div>
            ) : null}

            {resetMessage ? (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100"
              >
                {resetMessage}
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                  suppressHydrationWarning
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300"
                >
                  Remember me
                </label>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-100"
              suppressHydrationWarning
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900"
                    aria-hidden
                  />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold leading-6 text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Register here
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
          <Link
            href="/"
            className="font-medium text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
