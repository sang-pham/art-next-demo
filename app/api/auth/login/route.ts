import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../lib/http/server";
import { normalizeTokens, unwrapEnvelope } from "../../../../types/auth";
import { RT_COOKIE, setRefreshCookie } from "../../../../lib/auth/cookies";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    // Forward to backend
    const resp = await backend().post("/v1/auth/login", body);
    const { data, error } = unwrapEnvelope<any>(resp.data);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const tokens = normalizeTokens(data ?? resp.data);
    const accessToken =
      tokens.accessToken ?? (data?.token as string | undefined) ?? null;
    const refreshToken =
      tokens.refreshToken ??
      (data?.refresh as string | undefined) ??
      (data?.rt as string | undefined) ??
      null;

    const user = (data?.user ?? data?.profile ?? data) as unknown;

    const res = NextResponse.json({ accessToken, user }, { status: 200 });

    // Set refresh cookie if present
    if (refreshToken) {
      setRefreshCookie(res, refreshToken);
    }

    return res;
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const payload = err?.response?.data ?? { message: "Login failed" };
    return NextResponse.json(payload, { status });
  }
}
