import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy: POST /api/sql-logs/upload -> POST {BACKEND_URL}/v1/sql-logs/upload
 * - Forwards Authorization header from client
 * - Forwards multipart/form-data body (supports "file" and optional fields like "db")
 * - Returns backend JSON payload (unwrap not strictly needed; pass-through)
 */
export async function POST(req: NextRequest) {
  try {
    const baseURL = process.env.BACKEND_URL;
    if (!baseURL) {
      return NextResponse.json(
        { message: "BACKEND_URL is not configured" },
        { status: 500 }
      );
    }

    const auth =
      req.headers.get("authorization") || req.headers.get("Authorization") || "";

    // Read incoming multipart form-data
    const inForm = await req.formData();

    // Build new FormData to ensure compatibility when forwarding
    const outForm = new FormData();
    for (const [key, value] of inForm.entries()) {
      // value can be string, Blob/File
      outForm.append(key, value as any);
    }

    const resp = await fetch(new URL("/v1/sql-logs/upload", baseURL), {
      method: "POST",
      headers: auth ? { Authorization: auth } : undefined,
      body: outForm,
    });

    const contentType = resp.headers.get("content-type") || "";
    if (!resp.ok) {
      if (contentType.includes("application/json")) {
        const j = await resp.json().catch(() => ({}));
        return NextResponse.json(j, { status: resp.status });
      }
      const t = await resp.text().catch(() => "Upload failed");
      return NextResponse.json({ message: t }, { status: resp.status });
    }

    if (contentType.includes("application/json")) {
      const j = await resp.json();
      return NextResponse.json(j, { status: resp.status });
    }
    const t = await resp.text();
    return NextResponse.json({ message: t }, { status: resp.status });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const payload =
      err?.response?.data ?? { message: "Failed to upload SQL logs" };
    return NextResponse.json(payload, { status });
  }
}