"use client";

import { supabase } from "@/src/lib/supabaseClient";
import {
  createAttendanceSession,
  rotateAttendanceSessionToken,
  type CreateAttendanceSessionResult,
} from "@/src/services/api";
import QRCode from "react-qr-code";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

type FacultyCourse = {
  id: string;
  name: string;
  code: string;
};

export default function FacultyDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<CreateAttendanceSessionResult | null>(
    null,
  );
  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseError, setNewCourseError] = useState<string | null>(null);
  const [creatingCourse, setCreatingCourse] = useState(false);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCourses([]);
        setSelectedCourseId("");
        setError("Sign in as faculty to start attendance.");
        return;
      }

      const { data, error: coursesError } = await supabase
        .from("courses")
        .select("id, name, code")
        .eq("faculty_id", user.id)
        .order("code", { ascending: true });

      if (coursesError) throw new Error(coursesError.message);
      const rows = (data ?? []) as FacultyCourse[];
      setCourses(rows);
      setSelectedCourseId((prev) => {
        if (prev && rows.some((r) => r.id === prev)) return prev;
        return rows[0]?.id ?? "";
      });
    } catch (e) {
      setCourses([]);
      setSelectedCourseId("");
      setError(
        e instanceof Error ? e.message : "Could not load your faculty courses.",
      );
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  async function handleCreateCourse(e: FormEvent) {
    e.preventDefault();
    setNewCourseError(null);
    const name = newCourseName.trim();
    const code = newCourseCode.trim().toUpperCase();
    if (!name) {
      setNewCourseError("Enter a course name.");
      return;
    }
    if (!code) {
      setNewCourseError("Enter a course code (for example CS101).");
      return;
    }

    setCreatingCourse(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setNewCourseError("You are not signed in.");
        return;
      }

      const { error: insertError } = await supabase.from("courses").insert({
        name,
        code,
        faculty_id: user.id,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          setNewCourseError(
            "That course code is already taken. Choose a different code.",
          );
        } else {
          setNewCourseError(insertError.message);
        }
        return;
      }

      setNewCourseName("");
      setNewCourseCode("");
      setError(null);
      await loadCourses();
    } catch (err) {
      setNewCourseError(
        err instanceof Error ? err.message : "Could not create the course.",
      );
    } finally {
      setCreatingCourse(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    const sessionId = session.sessionId;
    setSecondsLeft(15);
    setPresentCount(0);

    let mounted = true;

    async function loadInitialCount() {
      const { count, error: countError } = await supabase
        .from("attendance_logs")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("status", "present");
      if (!countError && mounted) {
        setPresentCount(count ?? 0);
      }
    }

    void loadInitialCount();

    const channel = supabase
      .channel(`attendance-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance_logs",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          setPresentCount((c) => c + 1);
        },
      )
      .subscribe();

    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
      void supabase.removeChannel(channel);
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const sessionId = session.sessionId;
    const rotateId = setInterval(() => {
      void (async () => {
        try {
          const rotated = await rotateAttendanceSessionToken(sessionId);
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  qrTokenSecret: rotated.qrTokenSecret,
                  expiresAt: rotated.expiresAt,
                }
              : prev,
          );
          setSecondsLeft(15);
        } catch (e) {
          setError(
            e instanceof Error
              ? e.message
              : "Could not rotate attendance QR token.",
          );
        }
      })();
    }, 15000);

    return () => clearInterval(rotateId);
  }, [session]);

  async function handleStartAttendance() {
    setError(null);
    if (!selectedCourseId) {
      setError("No faculty course selected. Create a course assigned to your account.");
      return;
    }
    setLoading(true);
    try {
      const result = await createAttendanceSession(selectedCourseId);
      setSession(result);
    } catch (e) {
      setSession(null);
      setError(
        e instanceof Error ? e.message : "Could not start attendance session.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleStopSession() {
    setSession(null);
    setSecondsLeft(0);
    setPresentCount(0);
    setError(null);
  }

  async function handleSignOut() {
    document.cookie = "cc_auth=; Path=/; Max-Age=0; SameSite=Lax";
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-zinc-50 font-sans dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(59,130,246,0.12),transparent)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(59,130,246,0.08),transparent)]"
        aria-hidden
      />

      <header className="relative border-b border-zinc-200/80 bg-white/70 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Faculty dashboard
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Attendance sessions
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
        <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Selected course
          </h2>
          {coursesLoading ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Loading your courses…
            </p>
          ) : courses.length === 0 ? (
            <div className="mt-3 space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                You do not have any courses yet. Create one here so you can start
                an attendance session. Students enroll separately (or an admin can
                enroll them) using this course.
              </p>
              <form
                onSubmit={(ev) => void handleCreateCourse(ev)}
                className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/50"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  New course
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Course name
                    </span>
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(ev) => setNewCourseName(ev.target.value)}
                      placeholder="Introduction to Computing"
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
                      autoComplete="off"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Course code{" "}
                      <span className="font-normal text-zinc-400">(unique)</span>
                    </span>
                    <input
                      type="text"
                      value={newCourseCode}
                      onChange={(ev) =>
                        setNewCourseCode(ev.target.value.toUpperCase())
                      }
                      placeholder="CS101"
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
                      autoComplete="off"
                    />
                  </label>
                </div>
                {newCourseError ? (
                  <p
                    role="alert"
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {newCourseError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={creatingCourse || coursesLoading}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
                >
                  {creatingCourse ? "Creating…" : "Create course"}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose one of your courses
              </p>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4">
            <Link
              href="/faculty/appointments"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
            >
              <CalendarDays className="size-4" aria-hidden />
              View appointment requests
            </Link>
          </div>

          {!session ? (
            <button
              type="button"
              onClick={handleStartAttendance}
              disabled={loading || coursesLoading || courses.length === 0}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:outline-blue-400"
            >
              {loading ? "Starting…" : "Start Attendance"}
            </button>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
            >
              {error}
            </div>
          ) : null}
        </section>

        {session ? (
          <section className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-8">
            <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Session QR
                </h2>
                <p className="mt-1 font-mono text-xs text-zinc-600 break-all dark:text-zinc-300">
                  {session.qrTokenSecret}
                </p>
                <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Students marked present: {presentCount}
                </p>
              </div>
              <div
                className="flex shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold tabular-nums text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-100"
                aria-live="polite"
              >
                <span className="text-amber-700/80 dark:text-amber-300/80">
                  Timer
                </span>
                <span>{secondsLeft}s</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-zinc-200 dark:bg-white dark:ring-zinc-700">
              <QRCode
                value={JSON.stringify({
                  sessionId: session.sessionId,
                  token: session.qrTokenSecret,
                })}
                size={220}
                level="M"
                className="h-auto max-w-full"
              />
            </div>

            <button
              type="button"
              onClick={handleStopSession}
              className="inline-flex w-full max-w-xs items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus-visible:outline-zinc-500 sm:w-auto"
            >
              Stop Session
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
