import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RT_COOKIE = "rt";
const TOKEN_COOKIE = "token"; // fallback for demo login

// Publicly accessible pages (everything else requires auth)
const PUBLIC_PATHS = new Set<string>(["/login", "/register"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasRt = !!req.cookies.get(RT_COOKIE)?.value;
  const hasToken = !!req.cookies.get(TOKEN_COOKIE)?.value; // allows demo cookie-based login
  const isAuthed = hasRt || hasToken;

  const isPublic = PUBLIC_PATHS.has(pathname);

  // Require auth for all non-public routes
  if (!isAuthed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // If already authenticated, redirect away from /login and /register to homepage
  if (isAuthed && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except API routes, Next.js internals, and static assets
  // Still runs on /login and /register to redirect authenticated users away.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
