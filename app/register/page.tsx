"use client";

import React, { FormEvent, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/authProvider";
import Link from "next/link";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isUsername(s: string) {
  // Letters, numbers, dot, underscore, hyphen; min length 3
  return /^[a-zA-Z0-9._-]{3,}$/.test(s);
}

function RegisterPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/profile";
  const { register: registerUser } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ username: false, email: false, password: false });

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!isUsername(username))
      errs.username = "Username must be at least 3 characters and contain only letters, numbers, . _ -";
    if (!isEmail(email)) errs.email = "Enter a valid email address";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    return errs;
  }, [username, email, password]);

  const isInvalid = useMemo(() => Object.keys(fieldErrors).length > 0, [fieldErrors]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isInvalid) {
        setTouched({ username: true, email: true, password: true });
        setSubmitting(false);
        return;
      }
      await registerUser({ username, email, password });
      router.push(next);
      router.refresh();
    } catch (err: any) {
      const status = err?.response?.status ?? 0;
      const serverMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message;
      const msg =
        serverMsg ||
        (status === 409
          ? "Email or username already exists."
          : status === 400
          ? "Invalid registration details."
          : "Registration failed. Please try again.");
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen grid lg:grid-cols-2 bg-white" suppressHydrationWarning>
      {/* Left: Background image */}
      <div className="relative hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/assets/banner.png)" }}
          aria-hidden
        />
        {/* <div className="absolute inset-0 bg-black/30" aria-hidden /> */}
        <div className="relative z-10 h-full w-full flex items-end p-8">
          <div className="text-white max-w-lg">
          
          </div>
        </div>
      </div>

      {/* Right: Register form */}
      <div className="flex items-center justify-center py-10 px-6">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="mb-3 flex items-center gap-2">
              <img src="/assets/logo.png" alt="Logo" className="h-15 w-15" />
              <h1 className="m-0">Đăng ký</h1>
            </div>

            {error ? (
              <div role="alert" className="alert alert-error mt-2">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="form" noValidate suppressHydrationWarning>
              <div>
                <label className="label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  className="input"
                  type="text"
                  autoComplete="username"
                  suppressHydrationWarning
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                  required
                  placeholder="yourusername"
                  aria-invalid={touched.username ? !!fieldErrors.username : undefined}
                />
                {touched.username && fieldErrors.username ? (
                  <div role="alert" className="text-red-600 mt-1">
                    {fieldErrors.username}
                  </div>
                ) : null}
              </div>
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  suppressHydrationWarning
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  required
                  placeholder="you@example.com"
                  aria-invalid={touched.email ? !!fieldErrors.email : undefined}
                />
                {touched.email && fieldErrors.email ? (
                  <div role="alert" className="text-red-600 mt-1">
                    {fieldErrors.email}
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
                  suppressHydrationWarning
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  required
                  placeholder="At least 8 characters"
                  aria-invalid={touched.password ? !!fieldErrors.password : undefined}
                />
                {touched.password && fieldErrors.password ? (
                  <div role="alert" className="text-red-600 mt-1">
                    {fieldErrors.password}
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

            <p className="muted mt-2">
              Already have an account?{" "}
              <Link className="btn btn-ghost" href={`/login?next=${encodeURIComponent(next)}`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen grid lg:grid-cols-2">
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
          </div>
          <div className="flex items-center justify-center py-10 px-6">
            <div className="w-full max-w-md">
              <div className="card">
                <h1>Create your account</h1>
                <p className="muted">Loading...</p>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <RegisterPageInner />
    </Suspense>
  );
}