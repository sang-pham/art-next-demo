"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { createBrowserClient } from "../../lib/http/client";
import { useToast } from "../../components/feedback/ToastProvider";
import Table from "../../components/data/Table";

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

  // Normalize various possible API response shapes into table rows
  function toArrayRows(data: any): AnyRec[] {
    if (Array.isArray(data)) {
      return data.map((item) => (item && typeof item === "object" ? item : { value: item }));
    }
    if (data && typeof data === "object") {
      const candidates = [
        (data as any).rows,
        (data as any).records,
        (data as any).data,
        (data as any).items,
        (data as any).result,
        (data as any).results,
        (data as any).suggestions,
      ];
      for (const arr of candidates) {
        if (Array.isArray(arr)) {
          return arr.map((item) => (item && typeof item === "object" ? item : { value: item }));
        }
      }
      return [data];
    }
    return data != null ? [{ value: data }] : [];
  }

  // Build table columns from row keys (limited to first 20 keys for readability)
  function toColumns(rows: AnyRec[]) {
    const keySet = new Set<string>();
    rows.forEach((r) => {
      if (r && typeof r === "object") {
        Object.keys(r).forEach((k) => keySet.add(k));
      }
    });
    const keys = Array.from(keySet).slice(0, 20);
    return keys.map((key) => ({
      key,
      header: key,
      sortable: true,
    }));
  }

  const rows = useMemo(() => toArrayRows(result), [result]);
  const columns = useMemo(() => toColumns(rows), [rows]);

  return (
    <Layout>
      <section className="mx-auto my-8 px-4 w-[90vw] max-w-none">
        <div className="card">
          <h1 className="m-0">Analysis</h1>
          <p className="muted mt-1">
            Select database and let Open AI help you analyze queries and make suggestions
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
                {rows.length > 0 && columns.length > 0 ? (
                  <div className="rounded-md border border-gray-200 bg-white p-3">
                    <h3 className="text-base font-semibold m-0 mb-3">Analysis result</h3>
                    <Table columns={columns as any} data={rows} />
                  </div>
                ) : null}

                <details className="rounded-md border border-gray-200 bg-white p-3">
                  <summary className="text-base font-semibold cursor-pointer">Raw response</summary>
                  <pre className="text-xs whitespace-pre-wrap m-0 mt-2">{pretty(result)}</pre>
                </details>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </Layout>
  );
}