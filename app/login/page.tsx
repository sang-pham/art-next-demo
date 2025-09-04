"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/authProvider";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/profile";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!isEmail(email)) errs.email = "Enter a valid email address";
    if (password.length < 1) errs.password = "Password is required";
    return errs;
  }, [email, password]);

  const isInvalid = useMemo(() => Object.keys(fieldErrors).length > 0, [fieldErrors]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isInvalid) {
        setSubmitting(false);
        return;
      }
      await login(email, password);
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
    <section style={{ maxWidth: 420, margin: "2rem auto", padding: "1rem" }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }} noValidate>
        <label>
          <div>Email</div>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            aria-invalid={!!fieldErrors.email}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          {fieldErrors.email ? (
            <div role="alert" style={{ color: "crimson" }}>{fieldErrors.email}</div>
          ) : null}
        </label>
        <label>
          <div>Password</div>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            aria-invalid={!!fieldErrors.password}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          {fieldErrors.password ? (
            <div role="alert" style={{ color: "crimson" }}>{fieldErrors.password}</div>
          ) : null}
        </label>
        {error ? (
          <div role="alert" style={{ color: "crimson" }}>
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={submitting || isInvalid}
          style={{
            padding: "0.5rem 0.75rem",
            cursor: submitting || isInvalid ? "not-allowed" : "pointer",
            opacity: submitting || isInvalid ? 0.7 : 1,
          }}
          aria-disabled={submitting || isInvalid}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p style={{ marginTop: "0.75rem" }}>
        Don't have an account?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`}>Register</Link>
      </p>
    </section>
  );
}