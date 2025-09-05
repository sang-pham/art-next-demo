import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../lib/http/server";
import { normalizeTokens, unwrapEnvelope } from "../../../../types/auth";
import { RT_COOKIE, setRefreshCookie } from "../../../../lib/auth/cookies";

export async function POST(req: NextRequest) {
  try {
    const raw = (await req.json()) as Record<string, unknown>;

    // Normalize payload: backend expects "identifier" (not "email")
    const payload: Record<string, unknown> = { ...(raw || {}) };
    if (
      payload &&
      typeof payload === "object" &&
      !("identifier" in payload) &&
      "email" in payload
    ) {
      (payload as any).identifier = (payload as any).email;
      delete (payload as any).email;
    }

    // Forward to backend
    const resp = await backend().post("/v1/auth/login", payload);
    const { data, error } = unwrapEnvelope<any>(resp.data);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Normalize tokens from top level and also from nested { tokens: {...} } if present
    const topTokens = normalizeTokens(data ?? resp.data);
    const nestedTokens =
      data && typeof data === "object" && "tokens" in (data as any)
        ? normalizeTokens((data as any).tokens)
        : {};
    const tokens = { ...topTokens, ...nestedTokens };

    const accessToken =
      tokens.accessToken ??
      ((data as any)?.token as string | undefined) ??
      null;

    const refreshToken =
      tokens.refreshToken ??
      ((data as any)?.refresh as string | undefined) ??
      ((data as any)?.rt as string | undefined) ??
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
