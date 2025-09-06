import { cookies, headers } from "next/headers";
import Layout from "../../components/layout/Layout";

type User = {
  id?: string | number;
  email?: string;
  name?: string;
  [k: string]: unknown;
};

async function loadUser(): Promise<User | null> {
  // Next 15 types mark cookies()/headers() as async-capable; await to satisfy TS.
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

  const hdrs = await headers();
  const userAgent = hdrs.get("user-agent") ?? "";

  // Build absolute URL for server-side fetch to avoid "Failed to parse URL" with relative paths
  const xfHost = hdrs.get("x-forwarded-host") ?? null;
  const host = xfHost || hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const envOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim();
  const origin =
    envOrigin && envOrigin.length > 0
      ? envOrigin
      : host
        ? `${proto}://${host}`
        : "http://localhost:3000";
  const url = new URL("/api/auth/me", origin).toString();

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
      "user-agent": userAgent,
    },
  });

  if (!res.ok) {
    return null;
  }
  return (await res.json()) as User;
}

export default async function ProfilePage() {
  const user = await loadUser();

  return (
    <Layout>
      {!user ? (
        <section className="narrow">
          <div className="card">
            <h1>Profile</h1>
            <div className="alert alert-error mt-2" role="alert">
              Not authenticated.
            </div>
          </div>
        </section>
      ) : (
        <section className="narrow">
          <div className="card">
            <h1>Profile</h1>
            <div className="grid gap-2 mt-3">
              <p>
                <strong>ID:</strong> {String(user.id ?? "—")}
              </p>
              <p>
                <strong>Email:</strong> {String(user.email ?? "—")}
              </p>
              <p>
                <strong>Name:</strong> {String(user.name ?? "—")}
              </p>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}