import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RT_COOKIE = "rt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /profile (see matcher below). Allow assets and API by default.
  if (pathname.startsWith("/profile")) {
    const hasRt = !!req.cookies.get(RT_COOKIE)?.value;
    if (!hasRt) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
