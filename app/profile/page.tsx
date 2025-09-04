import { cookies, headers } from "next/headers";

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

  const url = `${process.env.NEXT_PUBLIC_APP_ORIGIN ?? ""}/api/auth/me` || "/api/auth/me";
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

  if (!user) {
    // Should be protected by middleware, but handle gracefully
    return (
      <section style={{ maxWidth: 680, margin: "2rem auto", padding: "1rem" }}>
        <h1>Profile</h1>
        <p>Not authenticated.</p>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 680, margin: "2rem auto", padding: "1rem" }}>
      <h1>Profile</h1>
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
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
    </section>
  );
}