import { NextRequest, NextResponse } from "next/server";

type CookieAuth = {
  role?: string;
  userId?: string;
};

function parseAuthCookie(raw: string | undefined): CookieAuth | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as CookieAuth;
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const auth = parseAuthCookie(req.cookies.get("cc_auth")?.value);

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  if (!auth?.userId || !auth?.role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/faculty") && auth.role !== "faculty") {
    const url = req.nextUrl.clone();
    url.pathname =
      auth.role === "admin" ? "/admin/users" : "/student/dashboard";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/student") && auth.role !== "student") {
    const url = req.nextUrl.clone();
    url.pathname =
      auth.role === "admin" ? "/admin/users" : "/faculty/dashboard";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && auth.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname =
      auth.role === "faculty" ? "/faculty/dashboard" : "/student/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};

