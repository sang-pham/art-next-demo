import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../lib/http/server";
import { normalizeTokens, unwrapEnvelope } from "../../../../types/auth";
import { RT_COOKIE, setRefreshCookie } from "../../../../lib/auth/cookies";

async function getAccessTokenFromAuthHeader(
  req: NextRequest
): Promise<string | null> {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function GET(req: NextRequest) {
  try {
    let accessToken = await getAccessTokenFromAuthHeader(req);

    // If no access token provided, try refresh with cookie
    if (!accessToken) {
      const rt = req.cookies.get(RT_COOKIE)?.value;
      if (!rt) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const refreshResp = await backend().post("/v1/auth/refresh", {
        refreshToken: rt,
        refresh_token: rt,
      });

      const { data: refreshData, error: refreshErr } = unwrapEnvelope<any>(
        refreshResp.data
      );
      if (refreshErr) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const tokens = normalizeTokens(refreshData ?? refreshResp.data);
      accessToken =
        tokens.accessToken ??
        (refreshData?.token as string | undefined) ??
        null;

      // Prepare to rotate RT cookie if backend returned a new one
      const newRt =
        tokens.refreshToken ??
        (refreshData?.refresh as string | undefined) ??
        (refreshData?.rt as string | undefined) ??
        null;

      const tmpRes = NextResponse.next();

      if (newRt) {
        setRefreshCookie(tmpRes, newRt);
      }

      // Merge cookies from tmpRes into our final response later
      // by copying its cookie headers to the final response we create below.
      // We'll store them here to reuse.
      const setCookieHeaders = tmpRes.headers.getSetCookie();

      // Now fetch user with the new access token
      const meResp = await backend().get("/v1/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: userData, error: userErr } = unwrapEnvelope<any>(
        meResp.data
      );
      if (userErr) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const res = NextResponse.json(userData ?? meResp.data, { status: 200 });
      for (const sc of setCookieHeaders) res.headers.append("Set-Cookie", sc);
      return res;
    }

    // Have access token already: just call backend
    const meResp = await backend().get("/v1/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data, error } = unwrapEnvelope<any>(meResp.data);
    if (error) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(data ?? meResp.data, { status: 200 });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const payload = err?.response?.data ?? {
      message: "Failed to load current user",
    };
    return NextResponse.json(payload, { status });
  }
}
