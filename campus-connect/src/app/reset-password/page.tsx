"use client";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const recoveryReadyRef = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
      return;
    }

    function markReady() {
      recoveryReadyRef.current = true;
      setReady(true);
      setError(null);
    }

    const timeoutId = window.setTimeout(() => {
      if (!recoveryReadyRef.current) {
        setError(
          "This reset link is invalid or expired. Request a new one from the login page.",
        );
      }
    }, 12000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        window.clearTimeout(timeoutId);
        markReady();
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.clearTimeout(timeoutId);
        markReady();
      }
    });

    return () => {
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setSuccess(true);
      document.cookie = "cc_auth=; Path=/; Max-Age=0; SameSite=Lax";
      await supabase.auth.signOut();
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update password.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 font-sans">
        <p className="text-center text-sm text-red-700 dark:text-red-300">
          Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
        </p>
      </div>
    );
  }

  if (!ready && !error) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-4 py-12 font-sans">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Verifying reset link…
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-blue-600 dark:text-blue-400"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (!ready && error) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12 text-center font-sans">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-blue-600 dark:text-blue-400"
        >
          Request a new reset link
        </Link>
        <Link href="/login" className="text-sm text-zinc-600 dark:text-zinc-400">
          Back to sign in
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-12 text-center font-sans">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          Password updated. Redirecting to sign in…
        </p>
        <Link href="/login" className="text-sm font-semibold text-blue-600">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-12 font-sans dark:bg-zinc-950 sm:px-6">
      <div className="relative w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            New password
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter a new password for your account.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
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
              className="flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {loading ? "Saving…" : "Update password"}
            </button>

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/login" className="font-semibold text-blue-600">
                Cancel and sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
