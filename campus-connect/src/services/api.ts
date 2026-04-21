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

export type AppointmentStatus =
  | "scheduled"
  | "requested"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

/** Faculty row joined on `appointments.faculty_id` (for student views). */
export type AppointmentFacultySummary = Pick<
  UserProfile,
  "id" | "name" | "email" | "department"
>;

export interface Appointment {
  id: string;
  student_id: string;
  faculty_id: string;
  scheduled_time: string;
  status: AppointmentStatus | string;
  created_at: string;
  /** Present when loaded with a `users` join on `faculty_id`. */
  faculty?: AppointmentFacultySummary | null;
}

const appointmentFacultySelect = `
  id,
  student_id,
  faculty_id,
  scheduled_time,
  status,
  created_at,
  faculty:users!faculty_id (
    id,
    name,
    email,
    department
  )
`;

function parseAppointmentFacultyRow(row: unknown): Appointment {
  const r = row as Appointment & {
    faculty?: AppointmentFacultySummary | AppointmentFacultySummary[] | null;
  };
  let faculty: AppointmentFacultySummary | null | undefined = r.faculty;
  if (Array.isArray(faculty)) {
    faculty = faculty[0] ?? null;
  }
  return {
    id: r.id,
    student_id: r.student_id,
    faculty_id: r.faculty_id,
    scheduled_time: r.scheduled_time,
    status: r.status,
    created_at: r.created_at,
    faculty: faculty ?? null,
  };
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

export interface RotateAttendanceSessionResult {
  sessionId: string;
  qrTokenSecret: string;
  expiresAt: string;
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

export async function rotateAttendanceSessionToken(
  sessionId: string,
): Promise<RotateAttendanceSessionResult> {
  const qrTokenSecret = generateQrTokenSecret();
  const expiresAt = new Date(Date.now() + 15 * 1000).toISOString();

  const { data, error } = await supabase
    .from("attendance_sessions")
    .update({
      qr_token_secret: qrTokenSecret,
      expires_at: expiresAt,
    })
    .eq("id", sessionId)
    .select("id, expires_at")
    .single();

  if (error) throw new Error(error.message);

  return {
    sessionId: data.id as string,
    qrTokenSecret,
    expiresAt: data.expires_at as string,
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

export interface EnsureProfileResult {
  success: boolean;
  id?: string;
  role?: string;
  error?: string;
}

export async function ensureProfile(): Promise<EnsureProfileResult> {
  const { data, error } = await supabase.functions.invoke("ensure-profile", {
    body: {},
  });
  if (error) throw new Error(error.message);
  return data as EnsureProfileResult;
}

export async function listFaculty(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, department, created_at")
    .eq("role", "faculty")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as UserProfile[];
}

export async function createAppointment(input: {
  studentId: string;
  facultyId: string;
  scheduledTimeIso: string;
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      student_id: input.studentId,
      faculty_id: input.facultyId,
      scheduled_time: input.scheduledTimeIso,
      status: "requested",
    })
    .select(appointmentFacultySelect)
    .single();

  if (error) throw new Error(error.message);
  return parseAppointmentFacultyRow(data);
}

export async function getStudentAppointments(
  studentId: string,
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentFacultySelect)
    .eq("student_id", studentId)
    .order("scheduled_time", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => parseAppointmentFacultyRow(row));
}

export async function getFacultyAppointments(
  facultyId: string,
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, student_id, faculty_id, scheduled_time, status, created_at")
    .eq("faculty_id", facultyId)
    .order("scheduled_time", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Appointment[];
}

export async function updateAppointmentStatus(input: {
  appointmentId: string;
  status: AppointmentStatus;
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: input.status })
    .eq("id", input.appointmentId)
    .select(appointmentFacultySelect)
    .single();

  if (error) throw new Error(error.message);
  return parseAppointmentFacultyRow(data);
}

