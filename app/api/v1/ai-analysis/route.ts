import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../lib/http/server";
import { unwrapEnvelope } from "../../../../types/auth";

/**
 * Proxy: GET /api/v1/ai-analysis -> GET {BACKEND}/v1/ai-analysis
 * - Forwards Authorization header
 * - Forwards query string (?db_name=... or others)
 * - Unwraps common { data, error } envelopes
 */
function getAuthHeader(req: NextRequest): string | undefined {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  return h || undefined;
}

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.search || "";
    const auth = getAuthHeader(req);

    const resp = await backend().get(`/v1/ai-analysis${search}`, {
      headers: auth ? { Authorization: auth } : {},
    });

    const { data, error } = unwrapEnvelope<any>(resp.data);
    if (error) {
      return NextResponse.json(error, { status: 400 });
    }
    return NextResponse.json(data ?? resp.data, { status: 200 });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const payload =
      err?.response?.data ?? { message: "AI analysis request failed" };
    return NextResponse.json(payload, { status });
  }
}