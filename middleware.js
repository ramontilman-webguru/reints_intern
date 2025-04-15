import { NextResponse } from "next/server";

// Default cookie names for NextAuth.js v4
const V4_AUTH_COOKIE_NAME_DEV = "next-auth.session-token";
const V4_AUTH_COOKIE_NAME_PROD = "__Secure-next-auth.session-token";

export function middleware(req) {
  // Determine the cookie name based on environment (or check both if unsure about protocol)
  const isSecure =
    req.nextUrl.protocol === "https:" || process.env.NODE_ENV === "production";
  const cookieName = isSecure
    ? V4_AUTH_COOKIE_NAME_PROD
    : V4_AUTH_COOKIE_NAME_DEV;

  const sessionCookie =
    req.cookies.get(cookieName) || req.cookies.get(V4_AUTH_COOKIE_NAME_DEV); // Check both just in case
  const isLoggedIn = !!sessionCookie;
  const { pathname } = req.nextUrl;

  // Allow access to login page, API routes, static files, etc.
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") || // Allow all API routes (incl. /api/auth)
    pathname.startsWith("/_next/") ||
    pathname.includes(".") // Assume files with extensions are static assets
  ) {
    return NextResponse.next();
  }

  // If user is not logged in (no session cookie) and tries to access a protected route, redirect to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    console.log(
      `[Middleware] Redirecting unauthenticated user from ${pathname} to ${loginUrl}`
    );
    return NextResponse.redirect(loginUrl);
  }

  // If logged in (session cookie exists), allow access
  return NextResponse.next();
}

// Configuration for the matcher remains the same
export const config = {
  matcher: [
    // Apply middleware to all routes except specific API routes and static files
    // We adjusted the exclusion logic above, so the matcher can be broader,
    // but let's keep it specific to dashboard for now.
    "/((?!_next/static|_next/image|favicon.ico|login).*)", // Exclude static/image/favicon/login
    "/dashboard/:path*",
  ],
};
