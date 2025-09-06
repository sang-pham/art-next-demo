import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../../../lib/http/server";
import { unwrapEnvelope } from "../../../../../../types/auth";

/**
 * Proxy: PUT /api/admin/users/:id/role -> PUT {BACKEND}/v1/admin/users/:id/role
 * Forwards Authorization header from client and returns backend payload.
 */

function getAuthHeader(req: NextRequest): string | undefined {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  return h || undefined;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const auth = getAuthHeader(req);
    const resp = await backend().put(`/v1/admin/users/${params.id}/role`, body, {
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
      err?.response?.data ?? { message: "Failed to update role" };
    return NextResponse.json(payload, { status });
  }
}