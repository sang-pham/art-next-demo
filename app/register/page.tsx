"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/authProvider";

function isEmail(s: string) {
  // Simple but effective email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/profile";
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!isEmail(email)) errs.email = "Enter a valid email address";
    if (name && name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (confirm !== password) errs.confirm = "Passwords do not match";
    return errs;
  }, [email, name, password, confirm]);

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
      await register({ email, password, name: name || undefined });
      router.push(next);
      router.refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ maxWidth: 480, margin: "2rem auto", padding: "1rem" }}>
      <h1>Create your account</h1>
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
          <div>Name (optional)</div>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-invalid={!!fieldErrors.name}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          {fieldErrors.name ? (
            <div role="alert" style={{ color: "crimson" }}>{fieldErrors.name}</div>
          ) : null}
        </label>

        <label>
          <div>Password</div>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 8 characters"
            aria-invalid={!!fieldErrors.password}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          {fieldErrors.password ? (
            <div role="alert" style={{ color: "crimson" }}>{fieldErrors.password}</div>
          ) : null}
        </label>

        <label>
          <div>Confirm password</div>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Re-enter password"
            aria-invalid={!!fieldErrors.confirm}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          {fieldErrors.confirm ? (
            <div role="alert" style={{ color: "crimson" }}>{fieldErrors.confirm}</div>
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
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </section>
  );
}