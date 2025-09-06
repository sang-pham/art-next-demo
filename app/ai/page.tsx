"use client";

import React, { useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { createBrowserClient } from "../../lib/http/client";
import { useToast } from "../../components/feedback/ToastProvider";

type AiAnalysis = Record<string, any>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <h3 className="text-base font-semibold m-0">{title}</h3>
      <div className="rounded-md border border-gray-200 bg-white p-3">{children}</div>
    </div>
  );
}

export default function AiPage() {
  const client = useMemo(() => createBrowserClient(), []);
  const { show } = useToast();

  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiAnalysis | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Send both q and text to be compatible with backend param naming
      const res = await client.get("/ai/analysis", {
        params: {
          q: text,
          text,
        },
      });

      const payload = res.data ?? {};
      setResult(payload);
      show({
        title: "AI analysis completed",
        variant: "success",
        duration: 2500,
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        "AI analysis failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  const pretty = React.useMemo(() => {
    if (!result) return "";
    try {
      return JSON.stringify(result, null, 2);
    } catch {
      return String(result);
    }
  }, [result]);

  // Attempt to surface common fields if the backend provides them
  const summary =
    (result as any)?.summary ||
    (result as any)?.overview ||
    (result as any)?.analysis ||
    null;

  const suggestions: string[] | undefined =
    (Array.isArray((result as any)?.suggestions) && (result as any)?.suggestions) ||
    (Array.isArray((result as any)?.recommendations) && (result as any)?.recommendations) ||
    undefined;

  const anomalies: Array<string | Record<string, any>> | undefined =
    (Array.isArray((result as any)?.anomalies) && (result as any)?.anomalies) ||
    (Array.isArray((result as any)?.issues) && (result as any)?.issues) ||
    undefined;

  return (
    <Layout>
      <section className="narrow">
        <div className="card">
          <h1 className="m-0">AI Analysis</h1>
          <p className="muted mt-1">
            Calls GET /v1/ai/analysis via our Next API proxy (/api/ai/analysis).
          </p>

          <div className="grid gap-3 mt-4">
            <label className="label" htmlFor="ai-input">
              Input text
            </label>
            <textarea
              id="ai-input"
              className="input min-h-[140px]"
              placeholder="Enter text to analyze"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={analyze}
                disabled={loading || text.trim().length === 0}
                aria-busy={loading || undefined}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setText("");
                  setResult(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Clear
              </button>
            </div>

            {error ? (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="grid gap-4">
                {summary ? (
                  <Section title="Summary">
                    <div className="whitespace-pre-wrap text-sm">{String(summary)}</div>
                  </Section>
                ) : null}

                {Array.isArray(suggestions) && suggestions.length > 0 ? (
                  <Section title="Suggestions">
                    <ul className="list-disc pl-5 m-0 text-sm">
                      {suggestions.map((s, i) => (
                        <li key={i}>{String(s)}</li>
                      ))}
                    </ul>
                  </Section>
                ) : null}

                {Array.isArray(anomalies) && anomalies.length > 0 ? (
                  <Section title="Anomalies">
                    <div className="grid gap-2">
                      {anomalies.map((a, i) => (
                        <div key={i} className="text-sm">
                          {typeof a === "string" ? (
                            a
                          ) : (
                            <code className="block whitespace-pre-wrap">
                              {JSON.stringify(a, null, 2)}
                            </code>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                ) : null}

                <Section title="Raw response">
                  <pre className="text-xs whitespace-pre-wrap m-0">{pretty}</pre>
                </Section>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </Layout>
  );
}