import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/http/server";
import { unwrapEnvelope } from "../../../types/auth";

/**
 * Proxy: GET /api/sql-logs -> GET {BACKEND}/v1/sql-logs
 * - Forwards Authorization header from the client (Bearer access token).
 * - Forwards query string (pagination/filters).
 * - Unwraps common { data, error } envelopes when present.
 */

function getAuthHeader(req: NextRequest): string | undefined {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  return h || undefined;
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthHeader(req);
    const search = req.nextUrl.search || "";
    const url = `/v1/sql-logs${search}`;

    const resp = await backend().get(url, {
      headers: auth ? { Authorization: auth } : {},
    });

    const { data, error } = unwrapEnvelope<any>(resp.data);
    if (error) {
      return NextResponse.json(error, { status: 400 });
    }
    return NextResponse.json(data ?? resp.data, { status: 200 });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const payload = err?.response?.data ?? { message: "Failed to load SQL logs" };
    return NextResponse.json(payload, { status });
  }
}