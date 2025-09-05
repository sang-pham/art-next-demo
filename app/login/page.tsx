"use client";

import { FormEvent, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/authProvider";

function LoginPageInner() {
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
  }

  return (
    <section className="narrow">
      <div className="card">
        <h1>Login</h1>

        {error ? (
          <div role="alert" className="alert alert-error mt-2">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="form" noValidate>
          <div>
            <label className="label" htmlFor="identifier">
              Email or username
            </label>
            <input
              id="identifier"
              className="input"
              type="text"
              autoComplete="username"
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
          Don&apos;t have an account?{" "}
          <Link className="btn btn-ghost" href={`/register?next=${encodeURIComponent(next)}`}>
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="narrow">
          <div className="card">
            <h1>Login</h1>
            <p className="muted">Loading...</p>
          </div>
        </section>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}