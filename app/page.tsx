"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/surfaces/Card";
import Table, { type Column } from "../components/data/Table";
import { createBrowserClient } from "../lib/http/client";
import { useToast } from "../components/feedback/ToastProvider";

type AnyRec = Record<string, any>;

function pick<T = any>(obj: AnyRec, keys: string[], fallback?: T): T | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return fallback;
}

function num(v: any): number {
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function truncate(s: any, max = 100): string {
  const str = String(s ?? "—");
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export default function DashboardPage() {
  const client = useMemo(() => createBrowserClient(), []);
  const { show } = useToast();

  const [items, setItems] = useState<AnyRec[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await client.get("/sql-logs/scan");
      const payload: any = res.data ?? {};
      const list =
        (Array.isArray(payload) && payload) ||
        (Array.isArray(payload.items) && payload.items) ||
        (Array.isArray(payload.data) && payload.data) ||
        (Array.isArray(payload.logs) && payload.logs) ||
        (Array.isArray(payload.entries) && payload.entries) ||
        (Array.isArray(payload.result) && payload.result) ||
        (Array.isArray(payload.records) && payload.records) ||
        (Array.isArray(payload?.data?.items) && payload.data.items) ||
        [];
      setItems(list as AnyRec[]);
      show({ title: "Scan completed", variant: "success", duration: 2000 });
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to scan SQL logs";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-scan on access per requirement
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Metrics
  const metrics = useMemo(() => {
    let total = items.length;
    let totalExec = 0;
    let maxExecMs = 0;
    for (const it of items) {
      const c = num(pick(it, ["exec_count", "count", "rowCount", "rows"], 0));
      const ms =
        num(pick(it, ["exec_time_ms", "max_exec_time_ms", "durationMs", "duration_ms", "elapsed_ms", "time_ms"], 0)) ||
        (() => {
          const sec = num(pick(it, ["elapsed", "duration"], 0));
          return sec ? Math.round(sec * 1000) : 0;
        })();
      totalExec += c;
      if (ms > maxExecMs) maxExecMs = ms;
    }
    return { total, totalExec, maxExecMs };
  }, [items]);

  // Columns (robust fallbacks; aligns with logs schema)
  const columns: Array<Column<AnyRec>> = [
    {
      key: "db",
      header: "Database",
      accessor: (row) => pick(row, ["db", "database", "name"], "—") as any,
    },
    {
      key: "sql_query",
      header: "SQL Query / Pattern",
      accessor: (row) => {
        const v = pick(row, ["sql_query", "sql", "query", "statement", "text"], "—");
        return <code className="text-xs">{truncate(v, 140)}</code>;
      },
      className: "max-w-[700px]",
    },
    {
      key: "exec_time_ms",
      header: "Exec Time (ms)",
      accessor: (row) => {
        const ms =
          (pick<number>(row, ["exec_time_ms", "max_exec_time_ms", "durationMs", "duration_ms", "elapsed_ms", "time_ms"])) ??
          ((() => {
            const sec = pick<number>(row, ["elapsed", "duration"]);
            return typeof sec === "number" ? Math.round(sec * 1000) : undefined;
          })());
        return typeof ms === "number" ? ms : "—";
      },
    },
    {
      key: "exec_count",
      header: "Exec Count",
      accessor: (row) => pick(row, ["exec_count", "count", "rowCount", "rows"], "—") as any,
    },
  ];

  return (
    <Layout>
      <section className="grid gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="m-0 text-sm text-slate-500">Scanned Items</h3>
            <p className="m-0 text-2xl font-semibold">{metrics.total}</p>
          </div>
          <div className="card">
            <h3 className="m-0 text-sm text-slate-500">Total Exec Count</h3>
            <p className="m-0 text-2xl font-semibold">{metrics.totalExec}</p>
          </div>
          <div className="card">
            <h3 className="m-0 text-sm text-slate-500">Max Exec Time (ms)</h3>
            <p className="m-0 text-2xl font-semibold">{metrics.maxExecMs}</p>
          </div>
        </div>

        <Card
          title="SQL Logs Scan"
          description="Latest scan from /v1/sql-logs/scan (proxied via /api/sql-logs/scan)."
        >
          <div className="flex items-center justify-between mb-3">
            <p className="muted m-0">{loading ? "Scanning..." : "Showing results"}</p>
            <div className="inline-flex items-center gap-2">
              <button className="btn btn-primary" onClick={load} disabled={loading}>
                {loading ? "Scanning..." : "Rescan"}
              </button>
            </div>
          </div>

          {err ? (
            <div className="alert alert-error mb-3" role="alert">
              {err}
            </div>
          ) : null}

          <Table<AnyRec>
            columns={columns}
            data={items}
            pagination
            defaultPageSize={10}
            emptyMessage={loading ? "Loading..." : "No scan results"}
          />
        </Card>
      </section>
    </Layout>
  );
}
