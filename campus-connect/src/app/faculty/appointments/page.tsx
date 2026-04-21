"use client";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabaseClient";
import {
  getFacultyAppointments,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
  type UserProfile,
} from "@/src/services/api";
import { Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export default function FacultyAppointmentsPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setFacultyId(null);
        setAuthChecked(true);
        setAppointments([]);
        setUsers([]);
        setError(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable appointments.",
        );
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setFacultyId(user?.id ?? null);
      setAuthChecked(true);
      if (!user) {
        setAppointments([]);
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: allUsers, error: usersError } = await supabase
        .from("users")
        .select("id, name, email, role, department, created_at");
      if (usersError) throw new Error(usersError.message);
      setUsers((allUsers ?? []) as unknown as UserProfile[]);

      const a = await getFacultyAppointments(user.id);
      setAppointments(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const userById = useMemo(() => {
    const m = new Map<string, UserProfile>();
    for (const u of users) m.set(u.id, u);
    return m;
  }, [users]);

  async function updateStatus(appointmentId: string, status: AppointmentStatus) {
    setToast(null);
    setUpdatingId(appointmentId);
    try {
      await updateAppointmentStatus({ appointmentId, status });
      await load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Could not update appointment.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="relative min-h-full flex-1 bg-zinc-50 pb-24 font-sans dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(59,130,246,0.12),transparent)] dark:bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(59,130,246,0.07),transparent)]"
        aria-hidden
      />

      <header className="relative border-b border-zinc-200/80 bg-white/70 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Faculty appointments
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Review and manage student requests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/faculty/dashboard"
              className="text-sm font-semibold text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Back to dashboard
            </Link>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <span>Loading…</span>
          </div>
        ) : !authChecked || !facultyId ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-medium">Sign in to manage appointments.</p>
            <Link
              href="/login"
              className="mt-3 inline-flex text-sm font-semibold text-amber-800 underline-offset-4 hover:underline dark:text-amber-200"
            >
              Go to login
            </Link>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          >
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
            No appointment requests yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {appointments.map((a) => {
              const student = userById.get(a.student_id);
              const isUpdating = updatingId === a.id;
              return (
                <li
                  key={a.id}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {student
                          ? `${student.name} (${student.email})`
                          : `Student · ${a.student_id.slice(0, 8)}…`}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(a.scheduled_time)}
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                      {String(a.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void updateStatus(a.id, "approved")}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? "Updating…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void updateStatus(a.id, "rejected")}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void updateStatus(a.id, "completed")}
                      className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Mark completed
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void updateStatus(a.id, "cancelled")}
                      className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {toast ? (
        <div
          role="alert"
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-red-900/50 bg-red-950/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur"
        >
          <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-100">{toast}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="shrink-0 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

