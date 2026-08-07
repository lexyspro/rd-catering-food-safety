import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];
const SUPERVISOR_ADMIN_ROUTES = ["/dashboard", "/export", "/records/suppliers/all", "/records/equipment-cleaning/all", "/records/general-cleaning/all", "/records/ingredients/all", "/records/temperature/all", "/records/calibration/all"];
const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes always
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user?.role as string;

  // Admin-only routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  // Supervisor + Admin routes
  if (SUPERVISOR_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "SUPERVISOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
