import { NextResponse } from "next/server";
import { clearRefreshCookie } from "../../../../lib/auth/cookies";

// Clear the HttpOnly refresh cookie. If your backend requires a logout call,
// you can forward to it here before clearing the cookie.
export async function POST() {
  const res = new NextResponse(null, { status: 204 });
  clearRefreshCookie(res);
  return res;
}
