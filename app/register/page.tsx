"use client";

import { FormEvent, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/authProvider";

function isEmail(s: string) {
  // Simple but effective email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function RegisterPageInner() {
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
    <section className="narrow">
      <div className="card">
        <h1>Create your account</h1>

        {error ? (
          <div role="alert" className="alert alert-error mt-2">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="form" noValidate>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email ? (
              <div role="alert" className="text-red-600 mt-1">
                {fieldErrors.email}
              </div>
            ) : null}
          </div>

          <div>
            <label className="label" htmlFor="name">
              Name (optional)
            </label>
            <input
              id="name"
              className="input"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name ? (
              <div role="alert" className="text-red-600 mt-1">
                {fieldErrors.name}
              </div>
            ) : null}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 8 characters"
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password ? (
              <div role="alert" className="text-red-600 mt-1">
                {fieldErrors.password}
              </div>
            ) : null}
          </div>

          <div>
            <label className="label" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Re-enter password"
              aria-invalid={!!fieldErrors.confirm}
            />
            {fieldErrors.confirm ? (
              <div role="alert" className="text-red-600 mt-1">
                {fieldErrors.confirm}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || isInvalid}
            aria-disabled={submitting || isInvalid}
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <section className="narrow">
          <div className="card">
            <h1>Create your account</h1>
            <p className="muted">Loading...</p>
          </div>
        </section>
      }
    >
      <RegisterPageInner />
    </Suspense>
  );
}