"use client";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabaseClient";
import { markAttendanceQR } from "@/src/services/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "scanning" | "processing" | "success";

function parseScanPayload(raw: string): {
  sessionId: string;
  token: string;
} | null {
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const sessionId =
      (typeof parsed.sessionId === "string" && parsed.sessionId) ||
      (typeof parsed.session_id === "string" && parsed.session_id) ||
      null;
    const token =
      (typeof parsed.token === "string" && parsed.token) ||
      (typeof parsed.scanned_token === "string" && parsed.scanned_token) ||
      null;
    if (sessionId && token) return { sessionId, token };
  } catch {
    // not JSON
  }
  const fallbackSession =
    typeof process.env.NEXT_PUBLIC_SCAN_FALLBACK_SESSION_ID === "string"
      ? process.env.NEXT_PUBLIC_SCAN_FALLBACK_SESSION_ID
      : "";
  if (fallbackSession) {
    return { sessionId: fallbackSession, token: trimmed };
  }
  return null;
}

export default function StudentScanPage() {
  const [phase, setPhase] = useState<Phase>("scanning");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured);
  const [toast, setToast] = useState<string | null>(
    isSupabaseConfigured
      ? null
      : "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable scanning.",
  );
  const [successDetail, setSuccessDetail] = useState<string | null>(null);

  const scannerRef = useRef<{ clear: () => Promise<void> } | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setStudentId(user?.id ?? null);
        setAuthChecked(true);
      })
      .catch(() => {
        setStudentId(null);
        setAuthChecked(true);
      });
  }, []);

  const runMarkAttendance = useCallback(
    async (decodedText: string) => {
      setToast(null);
      setSuccessDetail(null);

      if (!studentId) {
        setToast("Sign in required to mark attendance.");
        setPhase("scanning");
        return;
      }

      const parsed = parseScanPayload(decodedText);
      if (!parsed) {
        setToast(
          "Invalid QR code. Use a Campus Connect session QR, or set NEXT_PUBLIC_SCAN_FALLBACK_SESSION_ID for token-only codes.",
        );
        setPhase("scanning");
        return;
      }

      setPhase("processing");
      try {
        const body = await markAttendanceQR(
          studentId,
          parsed.sessionId,
          parsed.token,
        );

        if (!body.success) {
          setToast(body.message ?? "Attendance was not recorded.");
          setPhase("scanning");
          return;
        }

        setSuccessDetail(body.message ?? null);
        setPhase("success");
      } catch (e) {
        setToast(e instanceof Error ? e.message : "Something went wrong.");
        setPhase("scanning");
      }
    },
    [studentId],
  );

  useEffect(() => {
    if (!authChecked || phase !== "scanning") return;

    cancelledRef.current = false;
    let scannerInstance: { clear: () => Promise<void> } | null = null;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.max(200, Math.floor(edge * 0.72));
          return { width: size, height: size };
        },
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
        rememberLastUsedCamera: true,
      },
      false,
    );

    scannerInstance = scanner;
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        void (async () => {
          try {
            await scanner.clear();
          } catch {
            /* already stopped */
          }
          scannerRef.current = null;
          scannerInstance = null;
          await runMarkAttendance(decodedText);
        })();
      },
      () => {},
    );

    return () => {
      cancelledRef.current = true;
      const toClear = scannerInstance ?? scannerRef.current;
      scannerRef.current = null;
      if (toClear) {
        void toClear.clear().catch(() => {});
      }
    };
  }, [authChecked, phase, runMarkAttendance]);

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 text-zinc-50">
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/student/dashboard"
          className="inline-flex size-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-100 transition hover:bg-zinc-700"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-base font-semibold leading-tight">
            Scan attendance
          </h1>
          <p className="text-xs text-zinc-400">Point your camera at the QR</p>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col">
        {!authChecked ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-zinc-400">
            <Loader2 className="size-8 animate-spin" aria-hidden />
            <span className="text-sm">Checking session…</span>
          </div>
        ) : !studentId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-sm text-zinc-400">Sign in to mark attendance.</p>
            <Link
              href="/login"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Go to login
            </Link>
          </div>
        ) : phase === "success" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
            <CheckCircle2
              className="size-28 text-emerald-400 sm:size-36"
              strokeWidth={1.25}
              aria-hidden
            />
            <div className="text-center">
              <p className="text-2xl font-semibold text-white">
                You&apos;re checked in
              </p>
              {successDetail ? (
                <p className="mt-2 text-sm text-zinc-400">{successDetail}</p>
              ) : null}
            </div>
            <Link
              href="/student/dashboard"
              className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500"
            >
              Back to dashboard
            </Link>
          </div>
        ) : phase === "processing" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
            <Loader2 className="size-10 animate-spin text-emerald-400" />
            <p className="text-sm text-zinc-400">Recording attendance…</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              id="reader"
              className="min-h-[min(100dvh,32rem)] w-full flex-1 [&_img]:rounded-lg"
            />
          </div>
        )}
      </div>

      {toast ? (
        <div
          role="alert"
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-red-900/50 bg-red-950/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur"
        >
          <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-100">{toast}</p>
            <button
              type="button"
              onClick={() => {
                setToast(null);
                if (phase !== "success") setPhase("scanning");
              }}
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
