import { supabase } from "@/src/lib/supabaseClient";

export type UserRole = "student" | "faculty" | "admin";
export type AttendanceStatus = "present" | "absent";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  faculty_id: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  created_at: string;
}

export interface AttendanceSession {
  id: string;
  course_id: string;
  date: string; // YYYY-MM-DD
  qr_token_secret: string;
  expires_at: string;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  marked_at: string;
  created_at: string;
  attendance_sessions?: Pick<
    AttendanceSession,
    "id" | "course_id" | "date" | "expires_at"
  > | null;
}

export interface StudentAttendanceResult {
  courses: Course[];
  attendanceLogs: AttendanceLog[];
}

function base64UrlEncode(bytes: Uint8Array) {
  // btoa expects binary string
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function generateQrTokenSecret(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function getStudentAttendance(
  studentId: string,
): Promise<StudentAttendanceResult> {
  // Courses via enrollments
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select(
      `
      course:courses (
        id,
        name,
        code,
        faculty_id,
        created_at
      )
    `,
    )
    .eq("student_id", studentId);

  if (enrollmentsError) throw new Error(enrollmentsError.message);

  const courses: Course[] = (enrollments ?? [])
    .map((r) => (r as unknown as { course: Course | null }).course)
    .filter((c): c is Course => Boolean(c));

  // Attendance logs for student (including session details)
  const { data: logs, error: logsError } = await supabase
    .from("attendance_logs")
    .select(
      `
      id,
      session_id,
      student_id,
      status,
      marked_at,
      created_at,
      attendance_sessions (
        id,
        course_id,
        date,
        expires_at
      )
    `,
    )
    
    .eq("student_id", studentId)
    .order("marked_at", { ascending: false });

  if (logsError) throw new Error(logsError.message);

  return {
    courses,
    attendanceLogs: (logs ?? []) as unknown as AttendanceLog[],
  };
}

export interface CreateAttendanceSessionResult {
  sessionId: string;
  qrTokenSecret: string;
  expiresAt: string;
  date: string;
}

export async function createAttendanceSession(
  courseId: string,
): Promise<CreateAttendanceSessionResult> {
  const qrTokenSecret = generateQrTokenSecret();
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // +10m

  const { data, error } = await supabase
    .from("attendance_sessions")
    .insert({
      course_id: courseId,
      date,
      qr_token_secret: qrTokenSecret,
      expires_at: expiresAt,
    })
    .select("id, expires_at, date")
    .single();

  if (error) throw new Error(error.message);

  return {
    sessionId: data.id as string,
    qrTokenSecret,
    expiresAt: data.expires_at as string,
    date: data.date as string,
  };
}

export interface MarkAttendanceQRResult {
  success: boolean;
  attendance_log_id?: string;
  message?: string;
}

export async function markAttendanceQR(
  studentId: string,
  sessionId: string,
  token: string,
): Promise<MarkAttendanceQRResult> {
  const { data, error } = await supabase.functions.invoke("mark-attendance", {
    body: {
      student_id: studentId,
      session_id: sessionId,
      scanned_token: token,
    },
  });

  if (error) throw new Error(error.message);
  return data as MarkAttendanceQRResult;
}

