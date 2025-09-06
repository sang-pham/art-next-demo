import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../lib/http/server";
import { unwrapEnvelope } from "../../../../types/auth";

/**
 * Proxy: GET /api/admin/users -> GET {BACKEND}/v1/admin/users
 * Proxy: POST /api/admin/users -> POST {BACKEND}/v1/admin/users
 * 
 * Forwards Authorization header from client. Returns backend payload as-is,
 * unwrapping common { data, error } envelopes when present.
 */

function getAuthHeader(req: NextRequest): string | undefined {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  return h || undefined;
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthHeader(req);
    const resp = await backend().get("/v1/admin/users", {
      headers: auth ? { Authorization: auth } : {},
    });

    // Try to unwrap if the backend uses an envelope
    const { data, error } = unwrapEnvelope<any>(resp.data);
    if (error) {
      return NextResponse.json(error, { status: 400 });
    }
    return NextResponse.json(data ?? resp.data, { status: 200 });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const payload = err?.response?.data ?? { message: "Failed to load users" };
    return NextResponse.json(payload, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const auth = getAuthHeader(req);
    const resp = await backend().post("/v1/admin/users", body, {
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
      err?.response?.data ?? { message: "Failed to create user" };
    return NextResponse.json(payload, { status });
  }
}