"use client";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabaseClient";
import {
  getStudentAttendance,
  type AttendanceLog,
  type Course,
} from "@/src/services/api";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquareText,
  ScanLine,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function sessionMeta(log: AttendanceLog) {
  const raw = log.attendance_sessions;
  if (!raw) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== "object") return null;
  const o = row as {
    course_id?: string;
    date?: string;
    expires_at?: string;
  };
  if (!o.course_id || !o.date) return null;
  return {
    courseId: o.course_id,
    date: o.date,
    expiresAt: o.expires_at ?? null,
  };
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00");
  return Number.isNaN(d.getTime())
    ? isoDate
    : d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function formatMarkedAt(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRedirect, setAuthRedirect] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setAuthRedirect(false);
    if (!isSupabaseConfigured) {
      setAuthRedirect(true);
      setCourses([]);
      setLogs([]);
      setLoading(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAuthRedirect(true);
      setCourses([]);
      setLogs([]);
      setLoading(false);
      return;
    }
    try {
      const { courses: c, attendanceLogs: l } = await getStudentAttendance(
        user.id,
      );
      setCourses(c);
      setLogs(l);
    } catch (e) {
      setCourses([]);
      setLogs([]);
      setError(
        e instanceof Error ? e.message : "Could not load attendance data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const courseById = useMemo(() => {
    const m = new Map<string, Course>();
    for (const c of courses) m.set(c.id, c);
    return m;
  }, [courses]);

  const { presentCount, totalCount, percent } = useMemo(() => {
    const total = logs.length;
    const present = logs.filter((l) => l.status === "present").length;
    const pct =
      total === 0 ? null : Math.round((present / total) * 100);
    return { presentCount: present, totalCount: total, percent: pct };
  }, [logs]);

  async function handleSignOut() {
    document.cookie = "cc_auth=; Path=/; Max-Age=0; SameSite=Lax";
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    router.replace("/login");
  }

  return (
    <div className="relative min-h-full flex-1 bg-zinc-50 pb-28 font-sans dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(34,197,94,0.1),transparent)] dark:bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(34,197,94,0.06),transparent)]"
        aria-hidden
      />

      <header className="relative border-b border-zinc-200/80 bg-white/70 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList
              className="size-5 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Student dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your attendance
            </p>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <span>Loading attendance…</span>
          </div>
        ) : authRedirect ? (
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
            role="status"
          >
            <p className="font-medium">Sign in to view your attendance.</p>
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
              <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Total attendance
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <span className="text-4xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
                  {percent === null ? "—" : `${percent}%`}
                </span>
                {totalCount > 0 ? (
                  <span className="mb-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {presentCount} present · {totalCount} recorded
                  </span>
                ) : (
                  <span className="mb-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    No attendance records yet
                  </span>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                <BookOpen className="size-4 text-zinc-500" aria-hidden />
                Records
              </h2>

              {logs.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
                  When you scan a session QR, your marks will show up here.
                </p>
              ) : (
                <>
                  <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 md:block">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                            Course
                          </th>
                          <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                            Session date
                          </th>
                          <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                            Marked
                          </th>
                          <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {logs.map((log) => {
                          const meta = sessionMeta(log);
                          const course = meta
                            ? courseById.get(meta.courseId)
                            : undefined;
                          const title = course
                            ? `${course.code}: ${course.name}`
                            : meta
                              ? `Course · ${meta.courseId.slice(0, 8)}…`
                              : "—";
                          return (
                            <tr
                              key={log.id}
                              className="bg-white dark:bg-zinc-900/40"
                            >
                              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                                {title}
                              </td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                                {meta ? formatDate(meta.date) : "—"}
                              </td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                                {formatMarkedAt(log.marked_at)}
                              </td>
                              <td className="px-4 py-3">
                                {log.status === "present" ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                                    <CheckCircle2 className="size-3.5" />
                                    Present
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                                    <XCircle className="size-3.5" />
                                    Absent
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <ul className="space-y-3 md:hidden">
                    {logs.map((log) => {
                      const meta = sessionMeta(log);
                      const course = meta
                        ? courseById.get(meta.courseId)
                        : undefined;
                      const title = course
                        ? `${course.code}: ${course.name}`
                        : meta
                          ? `Course · ${meta.courseId.slice(0, 8)}…`
                          : "Session";
                      return (
                        <li
                          key={log.id}
                          className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                                {title}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                <CalendarDays className="size-3.5 shrink-0" />
                                {meta ? formatDate(meta.date) : "—"}
                              </p>
                              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                Marked {formatMarkedAt(log.marked_at)}
                              </p>
                            </div>
                            {log.status === "present" ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                                <CheckCircle2 className="size-3.5" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                                <XCircle className="size-3.5" />
                                Absent
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>
          </>
        )}
      </main>

      {!loading && !authRedirect && !error ? (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 flex-col gap-3 sm:bottom-8 sm:left-auto sm:right-8 sm:w-auto sm:translate-x-0">
          <Link
            href="/student/appointments"
            className="flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 active:scale-[0.99] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <MessageSquareText className="size-5 shrink-0" aria-hidden />
            Appointments
          </Link>
          <Link
            href="/student/scan"
            className="flex min-h-[3.75rem] items-center justify-center gap-3 rounded-full bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/25 transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus-visible:outline-emerald-400 sm:min-h-[4rem] sm:px-8 sm:text-lg"
          >
            <ScanLine className="size-6 shrink-0 sm:size-7" aria-hidden />
            Scan QR for Attendance
          </Link>
        </div>
      ) : null}
    </div>
  );
}
