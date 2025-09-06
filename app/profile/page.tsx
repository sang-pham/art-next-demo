"use client";

import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../lib/auth/authProvider";
import { getAccessToken } from "../../lib/auth/tokenStore";

type User = {
  id?: string | number;
  email?: string;
  name?: string;
  [k: string]: unknown;
};

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || "http://localhost:8081";

export default function ProfilePage() {
  const { accessToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = accessToken || getAccessToken();
    if (!token) {
      setUser(null);
      setError("Not authenticated.");
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${BACKEND}/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // keep include to allow backend to read cookies if needed (not strictly required for /me)
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          let body: any = {};
          try {
            body = await res.json();
          } catch {}
          const msg =
            body?.error?.message ||
            body?.message ||
            (res.status === 401 ? "Not authenticated." : "Failed to load user.");
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data: any) => {
        const userOut =
          (data && (data.user || data.profile)) !== undefined
            ? data.user || data.profile
            : data;
        setUser(userOut as User);
      })
      .catch((err: any) => {
        setError(String(err?.message || "Failed to load user."));
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <Layout>
      <section className="narrow">
        <div className="card">
          <h1>Profile</h1>

          {loading ? (
            <p className="muted mt-2">Loading...</p>
          ) : error ? (
            <div className="alert alert-error mt-2" role="alert">
              {error}
            </div>
          ) : !user ? (
            <div className="alert alert-error mt-2" role="alert">
              Not authenticated.
            </div>
          ) : (
            <div className="grid gap-2 mt-3">
              <p>
                <strong>ID:</strong> {String(user.id ?? "—")}
              </p>
              <p>
                <strong>Email:</strong> {String(user.email ?? "—")}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}