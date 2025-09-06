"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { createBrowserClient } from "../../lib/http/client";
import { useToast } from "../../components/feedback/ToastProvider";

type AnyRec = Record<string, any>;

export default function AnalysisPage() {
  const client = useMemo(() => createBrowserClient(), []);
  const { show } = useToast();

  // Databases from /v1/sql-logs/databases
  const [dbs, setDbs] = useState<string[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>("");

  // Analysis result from /v1/ai-analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnyRec | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDatabases() {
      try {
        const res = await client.get("/sql-logs/databases");
        const arr: any =
          (Array.isArray(res.data) && res.data) ||
          (Array.isArray(res.data?.data) && res.data.data) ||
          (Array.isArray(res.data?.databases) && res.data.databases) ||
          [];
        const names = arr
          .map((x: any) => (typeof x === "string" ? x : x?.name ?? x?.db ?? x?.db_name ?? ""))
          .filter((s: string) => s && typeof s === "string");
        setDbs(names);
        if (!selectedDb && names.length > 0) setSelectedDb(names[0]);
      } catch (e: any) {
        const msg =
          e?.response?.data?.error?.message ||
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load databases";
        setError(String(msg));
      }
    }
    loadDatabases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function analyze() {
    if (!selectedDb) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      // Per spec: call /v1/ai-analysis with db_name (proxied as /api/v1/ai-analysis)
      const res = await client.get("/v1/ai-analysis", {
        params: { db_name: selectedDb },
      });
      setResult(res.data ?? {});
      show({ title: "Analysis completed", variant: "success", duration: 2500 });
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        "Analysis failed";
      setError(String(msg));
    } finally {
      setAnalyzing(false);
    }
  }

  function pretty(data: any): string {
    try {
      return JSON.stringify(data ?? {}, null, 2);
    } catch {
      return String(data);
    }
  }

  return (
    <Layout>
      <section className="narrow">
        <div className="card">
          <h1 className="m-0">Analysis</h1>
          <p className="muted mt-1">
            Select a database from /v1/sql-logs/databases and run analysis via /v1/ai-analysis.
          </p>

          <div className="grid gap-3 mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                className="input"
                aria-label="Select database"
                value={selectedDb}
                onChange={(e) => setSelectedDb(e.target.value)}
              >
                <option value="">{dbs.length ? "Select database…" : "Loading databases…"}</option>
                {dbs.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-primary"
                onClick={analyze}
                disabled={analyzing || !selectedDb}
                aria-busy={analyzing || undefined}
              >
                {analyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>

            {error ? (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="grid gap-3">
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <h3 className="text-base font-semibold m-0 mb-2">Raw response</h3>
                  <pre className="text-xs whitespace-pre-wrap m-0">{pretty(result)}</pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </Layout>
  );
}