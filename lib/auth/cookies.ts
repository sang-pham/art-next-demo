import { NextResponse } from "next/server";

export const RT_COOKIE = "rt";

function isProd() {
  return process.env.NODE_ENV === "production";
}

export function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd(),
    path: "/",
    ...(typeof maxAge === "number" ? { maxAge } : {}),
  };
}

export function setRefreshCookie(
  res: NextResponse,
  token: string,
  maxAge?: number
) {
  res.cookies.set(RT_COOKIE, token, cookieOptions(maxAge));
}

export function clearRefreshCookie(res: NextResponse) {
  res.cookies.set(RT_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}
