"use client";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("email rate limit exceeded") ||
    (lower.includes("rate limit") && lower.includes("email"))
  ) {
    return "Too many signup email requests. Please wait a few minutes and try again, or ask admin to disable email confirmation while testing.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (lower.includes("password")) {
    return "Password is too weak. Use a longer password.";
  }
  if (lower.includes("email") && lower.includes("invalid")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

export default function RegisterPage() {
  const FACULTY_CODE = "CAMPUS_2026";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "faculty">(
    "student",
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (selectedRole === "faculty" && !verificationCode.trim()) {
      setError("Verification code is required for faculty registration.");
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable registration.",
      );
      setLoading(false);
      return;
    }

    try {
      const isFacultyVerified =
        selectedRole === "faculty" && verificationCode.trim() === FACULTY_CODE;
      const roleForDb: "student" | "faculty" = isFacultyVerified
        ? "faculty"
        : "student";

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            email: email.trim(),
            requested_role: selectedRole,
            faculty_code_valid: isFacultyVerified,
            role: roleForDb,
          },
        },
      });

      if (signUpError) {
        setError(formatAuthError(signUpError.message));
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: upsertError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            name: name.trim() || data.user.email?.split("@")[0] || "Student",
            email: email.trim(),
            role: roleForDb,
          },
          { onConflict: "id" },
        );

        if (upsertError) {
          setError(
            `Account created, but role profile update failed: ${upsertError.message}`,
          );
          setLoading(false);
          return;
        }
      }

      setSuccess(
        roleForDb === "faculty"
          ? "Faculty account created. You can sign in to the faculty portal."
          : selectedRole === "faculty"
            ? "Account created as student (faculty verification code was invalid)."
            : "Account created. If email confirmation is enabled, check your inbox before signing in.",
      );
      setLoading(false);
      router.replace("/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create your account.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-12 font-sans dark:bg-zinc-950 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create account
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign up with your school email
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl shadow-zinc-200/40 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/40 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                placeholder="Your name"
                suppressHydrationWarning
              />
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
              <label
                htmlFor="role"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "student" | "faculty")
                }
                className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                suppressHydrationWarning
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            {selectedRole === "faculty" ? (
              <div className="space-y-2">
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Verification code
                </label>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                  placeholder="Enter faculty verification code"
                  suppressHydrationWarning
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                placeholder="Create a password"
                suppressHydrationWarning
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your profile is created automatically in Supabase after signup.
              </p>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100"
              >
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-100"
              suppressHydrationWarning
            >
              {loading ? "Creating…" : "Create account"}
            </button>

            <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold leading-6 text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign in
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

