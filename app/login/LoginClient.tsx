"use client";

import React, { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/authProvider";
import { setCookie } from "cookies-next";

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/profile";
  const { login } = useAuth();

  // Identifier can be username or email
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInvalid = useMemo(
    () => identifier.trim().length === 0 || password.trim().length === 0,
    [identifier, password]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Demo behavior: set a cookie and navigate (replace with real login if desired)
    setCookie("token", "your_jwt_token", { maxAge: 60 * 60 * 24, path: "/" });
    router.push("/");
    // If you want to use real login flow, uncomment below:
    /*
    setSubmitting(true);
    setError(null);
    try {
      if (isInvalid) {
        setSubmitting(false);
        return;
      }
      await login(identifier, password);
      router.push(next);
      router.refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
    */
  }

  return (
    <section className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Background image (hidden on small screens) */}
      <div className="relative hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/assets/banner.png)",
          }}
          aria-hidden
        />
        {/* <div className="absolute inset-0 bg-black/30" aria-hidden /> */}
        <div className="relative z-10 h-full w-full flex items-end p-8">
          <div className="text-white max-w-lg"></div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex items-center justify-center py-10 px-6">
        <div className="w-full max-w-md">
          <div className="card">
            <h1>Login</h1>

            {error ? (
              <div role="alert" className="alert alert-error mt-2">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="form" noValidate suppressHydrationWarning>
              <div>
                <label className="label" htmlFor="identifier">
                  Email or username
                </label>
                <input
                  id="identifier"
                  className="input"
                  type="text"
                  autoComplete="username"
                  suppressHydrationWarning
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="you@example.com or yourusername"
                  aria-invalid={false}
                />
              </div>

              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  suppressHydrationWarning
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  aria-invalid={false}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || isInvalid}
                aria-disabled={submitting || isInvalid}
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="muted mt-2">
              Don't have an account?{" "}
              <Link className="btn btn-ghost" href={`/register?next=${encodeURIComponent(next)}`}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}