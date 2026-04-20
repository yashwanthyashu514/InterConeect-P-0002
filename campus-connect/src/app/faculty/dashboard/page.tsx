"use client";

import {
  createAttendanceSession,
  type CreateAttendanceSessionResult,
} from "@/src/services/api";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

/** Display-only mock; `id` must exist in `courses` for `createAttendanceSession` to succeed. */
const MOCK_COURSE = {
  label: "CS101: Data Structures",
  id:
    process.env.NEXT_PUBLIC_MOCK_COURSE_ID ??
    "00000000-0000-4000-8000-000000000001",
};

export default function FacultyDashboardPage() {
  const [session, setSession] = useState<CreateAttendanceSessionResult | null>(
    null,
  );
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setSecondsLeft(15);
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [session?.sessionId]);

  async function handleStartAttendance() {
    setError(null);
    setLoading(true);
    try {
      const result = await createAttendanceSession(MOCK_COURSE.id);
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
    setError(null);
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-zinc-50 font-sans dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(59,130,246,0.12),transparent)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(59,130,246,0.08),transparent)]"
        aria-hidden
      />

      <header className="relative border-b border-zinc-200/80 bg-white/70 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Faculty dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Attendance sessions
          </p>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
        <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Selected course
          </h2>
          <p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {MOCK_COURSE.label}
          </p>

          {!session ? (
            <button
              type="button"
              onClick={handleStartAttendance}
              disabled={loading}
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
