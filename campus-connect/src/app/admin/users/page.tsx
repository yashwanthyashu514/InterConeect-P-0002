"use client";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabaseClient";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  department: string | null;
  created_at: string;
};

const ROLE_OPTIONS: Array<UserRow["role"]> = ["student", "faculty", "admin"];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [draftRole, setDraftRole] = useState<Record<string, UserRow["role"]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
        );
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Sign in required.");
      }

      const { data, error: usersError } = await supabase
        .from("users")
        .select("id, name, email, role, department, created_at")
        .order("created_at", { ascending: false });

      if (usersError) throw new Error(usersError.message);
      const rows = (data ?? []) as unknown as UserRow[];
      setUsers(rows);
      const nextDrafts: Record<string, UserRow["role"]> = {};
      for (const row of rows) nextDrafts[row.id] = row.role;
      setDraftRole(nextDrafts);
    } catch (e) {
      setUsers([]);
      setError(e instanceof Error ? e.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changedCount = useMemo(() => {
    return users.filter((u) => draftRole[u.id] && draftRole[u.id] !== u.role).length;
  }, [draftRole, users]);

  async function saveRole(userId: string) {
    setToast(null);
    const nextRole = draftRole[userId];
    const existing = users.find((u) => u.id === userId);
    if (!nextRole || !existing || nextRole === existing.role) return;
    setSavingId(userId);
    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ role: nextRole })
        .eq("id", userId);
      if (updateError) throw new Error(updateError.message);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)),
      );
      setToast("Role updated.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Could not update role.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleSignOut() {
    document.cookie = "cc_auth=; Path=/; Max-Age=0; SameSite=Lax";
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    router.replace("/login");
  }

  return (
    <div className="relative min-h-full flex-1 bg-zinc-50 pb-24 font-sans dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(14,165,233,0.12),transparent)] dark:bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(14,165,233,0.07),transparent)]"
        aria-hidden
      />

      <header className="relative border-b border-zinc-200/80 bg-white/70 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-sky-600 dark:text-sky-400" />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Admin · User Roles
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage role access for all users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {changedCount} unsaved role change{changedCount === 1 ? "" : "s"}
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            Go to login
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <span>Loading users…</span>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          >
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    Current role
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    Change role
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map((u) => {
                  const selected = draftRole[u.id] ?? u.role;
                  const changed = selected !== u.role;
                  const saving = savingId === u.id;
                  return (
                    <tr key={u.id} className="bg-white dark:bg-zinc-900/40">
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {u.role}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={selected}
                            onChange={(e) =>
                              setDraftRole((prev) => ({
                                ...prev,
                                [u.id]: e.target.value as UserRow["role"],
                              }))
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => void saveRole(u.id)}
                            disabled={!changed || saving}
                            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {saving ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatDateTime(u.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

