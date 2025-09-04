import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../lib/http/server";
import { normalizeTokens, unwrapEnvelope } from "../../../../types/auth";
import { RT_COOKIE, setRefreshCookie } from "../../../../lib/auth/cookies";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get(RT_COOKIE)?.value;
    if (!cookie) {
      return NextResponse.json(
        { message: "Missing refresh token" },
        { status: 401 }
      );
    }

    // Some backends expect refreshToken, others refresh_token
    const body = { refreshToken: cookie, refresh_token: cookie };

    const resp = await backend().post("/v1/auth/refresh", body);
    const { data, error } = unwrapEnvelope<any>(resp.data);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const tokens = normalizeTokens(data ?? resp.data);
    const accessToken =
      tokens.accessToken ?? (data?.token as string | undefined) ?? null;
    const newRt =
      tokens.refreshToken ??
      (data?.refresh as string | undefined) ??
      (data?.rt as string | undefined) ??
      null;

    const res = NextResponse.json({ accessToken }, { status: 200 });

    // Rotate refresh cookie if returned
    if (newRt) {
      setRefreshCookie(res, newRt);
    }

    return res;
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const payload = err?.response?.data ?? { message: "Refresh failed" };
    return NextResponse.json(payload, { status });
  }
}
