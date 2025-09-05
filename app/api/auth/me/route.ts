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
        // Support multiple backend schemas
        refreshToken: rt,
        refresh_token: rt,
        token: rt,
        rt,
      });

      const { data: refreshData, error: refreshErr } = unwrapEnvelope<any>(
        refreshResp.data
      );
      // Treat error as real only if it carries meaningful fields
      if (refreshErr && (refreshErr.message || refreshErr.code !== undefined)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      // Normalize tokens from top-level and nested { tokens: {...} }
      const topTokens = normalizeTokens(refreshData ?? refreshResp.data);
      const nestedTokens =
        refreshData &&
        typeof refreshData === "object" &&
        "tokens" in (refreshData as any)
          ? normalizeTokens((refreshData as any).tokens)
          : {};
      const tokens = { ...topTokens, ...nestedTokens };
      accessToken =
        tokens.accessToken ??
        ((refreshData as any)?.token as string | undefined) ??
        null;

      // If still no access token, we cannot proceed
      if (!accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      // Prepare to rotate RT cookie if backend returned a new one
      const newRt =
        tokens.refreshToken ??
        (refreshData?.refresh as string | undefined) ??
        (refreshData?.rt as string | undefined) ??
        null;

      // We'll set the refresh cookie on the final response (if any) below.

      // Now fetch user with the new access token
      const meResp = await backend().get("/v1/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: userData, error: userErr } = unwrapEnvelope<any>(
        meResp.data
      );
      if (userErr && (userErr.message || userErr.code !== undefined)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const userOut =
        (userData && (userData as any).user) ??
        (userData && (userData as any).profile) ??
        userData ??
        (meResp.data as any)?.user ??
        (meResp.data as any)?.profile ??
        meResp.data;
      const res = NextResponse.json(userOut, { status: 200 });
      if (newRt) {
        setRefreshCookie(res, newRt);
      }
      return res;
    }

    // Have access token already: just call backend
    const meResp = await backend().get("/v1/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data, error } = unwrapEnvelope<any>(meResp.data);
    if (error && (error.message || error.code !== undefined)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userOut =
      (data && (data as any).user) ??
      (data && (data as any).profile) ??
      data ??
      (meResp.data as any)?.user ??
      (meResp.data as any)?.profile ??
      meResp.data;
    return NextResponse.json(userOut, { status: 200 });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const payload = err?.response?.data ?? {
      message: "Failed to load current user",
    };
    return NextResponse.json(payload, { status });
  }
}
