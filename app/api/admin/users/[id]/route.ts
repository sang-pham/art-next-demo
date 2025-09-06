import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../../lib/http/server";
import { unwrapEnvelope } from "../../../../../types/auth";

/**
 * Proxy: DELETE /api/admin/users/:id -> DELETE {BACKEND}/v1/admin/users/:id
 * Forwards Authorization header from client and returns backend payload.
 */

function getAuthHeader(req: NextRequest): string | undefined {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  return h || undefined;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthHeader(req);
    const resp = await backend().delete(`/v1/admin/users/${params.id}`, {
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
      err?.response?.data ?? { message: "Failed to delete user" };
    return NextResponse.json(payload, { status });
  }
}