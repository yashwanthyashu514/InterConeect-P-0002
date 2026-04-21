"use client";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabaseClient";
import {
  createAppointment,
  getStudentAppointments,
  listFaculty,
  type Appointment,
  type UserProfile,
} from "@/src/services/api";
import { CalendarDays, Loader2, Plus, RefreshCw } from "lucide-react";
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

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default function StudentAppointmentsPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  const [faculty, setFaculty] = useState<UserProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [scheduledTime, setScheduledTime] = useState(() =>
    toDatetimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)),
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setStudentId(null);
        setAuthChecked(true);
        setFaculty([]);
        setAppointments([]);
        setError(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable appointments.",
        );
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setStudentId(user?.id ?? null);
      setAuthChecked(true);
      if (!user) {
        setFaculty([]);
        setAppointments([]);
        setLoading(false);
        return;
      }

      const [f, a] = await Promise.all([
        listFaculty(),
        getStudentAppointments(user.id),
      ]);
      setFaculty(f);
      setAppointments(a);
      setSelectedFacultyId((prev) =>
        prev && f.some((row) => row.id === prev) ? prev : (f[0]?.id ?? ""),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const facultyById = useMemo(() => {
    const m = new Map<string, UserProfile>();
    for (const f of faculty) m.set(f.id, f);
    return m;
  }, [faculty]);

  const selectedFaculty = useMemo(
    () => faculty.find((f) => f.id === selectedFacultyId),
    [faculty, selectedFacultyId],
  );

  async function handleRequest() {
    setToast(null);
    setError(null);
    if (!studentId) {
      setToast("Please sign in to request an appointment.");
      return;
    }
    if (!selectedFacultyId) {
      setToast("Select a faculty member.");
      return;
    }

    const scheduled = new Date(scheduledTime);
    if (Number.isNaN(scheduled.getTime())) {
      setToast("Pick a valid date/time.");
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment({
        studentId,
        facultyId: selectedFacultyId,
        scheduledTimeIso: scheduled.toISOString(),
      });
      const withName = selectedFaculty?.name ?? "faculty";
      setToast(`Appointment requested with ${withName}.`);
      await load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Could not create appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-full flex-1 bg-zinc-50 pb-24 font-sans dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(99,102,241,0.12),transparent)] dark:bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(99,102,241,0.07),transparent)]"
        aria-hidden
      />

      <header className="relative border-b border-zinc-200/80 bg-white/70 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Appointments
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Choose a faculty member, then pick a time. Each request shows who it
              is with below.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/student/dashboard"
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

      <main className="relative mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <span>Loading…</span>
          </div>
        ) : !authChecked || !studentId ? (
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
        ) : (
          <>
            <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-8">
              <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                <Plus className="size-4 text-zinc-500" aria-hidden />
                Request an appointment
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Faculty member
                  </label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    aria-label="Faculty member for this appointment"
                    className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                    suppressHydrationWarning
                  >
                    {faculty.length === 0 ? (
                      <option value="">No faculty accounts found</option>
                    ) : (
                      faculty.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} — {f.email}
                          {f.department ? ` (${f.department})` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-zinc-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {selectedFaculty ? (
                <div
                  className="mt-5 rounded-xl border border-indigo-200/80 bg-indigo-50/90 px-4 py-3 dark:border-indigo-900/50 dark:bg-indigo-950/40"
                  aria-live="polite"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800 dark:text-indigo-200">
                    Request will be sent to
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {selectedFaculty.name}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {selectedFaculty.email}
                  </p>
                  {selectedFaculty.department ? (
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Department: {selectedFaculty.department}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <button
                type="button"
                disabled={submitting || faculty.length === 0}
                onClick={() => void handleRequest()}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Requesting…
                  </>
                ) : (
                  "Request appointment"
                )}
              </button>
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                <CalendarDays className="size-4 text-zinc-500" aria-hidden />
                Your requests
              </h2>

              {appointments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
                  No appointments yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {appointments.map((a) => {
                    const joined = a.faculty;
                    const f = joined
                      ? {
                          name: joined.name,
                          email: joined.email,
                          department: joined.department,
                        }
                      : facultyById.get(a.faculty_id);
                    return (
                      <li
                        key={a.id}
                        className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                              With faculty
                            </p>
                            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-50">
                              {f?.name ??
                                `Faculty (id ${a.faculty_id.slice(0, 8)}…)`}
                            </p>
                            {f?.email ? (
                              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                {f.email}
                              </p>
                            ) : null}
                            {f?.department ? (
                              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                Department: {f.department}
                              </p>
                            ) : null}
                            <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                              {formatDateTime(a.scheduled_time)}
                            </p>
                          </div>
                          <span className="inline-flex w-fit items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                            {String(a.status)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
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

