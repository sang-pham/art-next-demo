"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/layout/Layout";
import Table, { type Column } from "../../components/data/Table";
import { createBrowserClient } from "../../lib/http/client";
import { useAuth } from "../../lib/auth/authProvider";
import Modal from "../../components/overlay/Modal";

type SqlLog = Record<string, any>;

function pick<T = any>(obj: Record<string, any>, keys: string[], fallback?: T): T | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return fallback;
}

function formatTime(v: any): string {
  if (!v) return "—";
  const d =
    typeof v === "number"
      ? new Date(v)
      : typeof v === "string"
      ? new Date(v)
      : v instanceof Date
      ? v
      : null;
  if (!d || Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}

function truncate(s: any, max = 80): string {
  const str = String(s ?? "—");
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

export default function LogsPage() {
  const client = useMemo(() => createBrowserClient(), []);
  const [logs, setLogs] = useState<SqlLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [dbs, setDbs] = useState<string[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { accessToken } = useAuth();

  async function load() {
    if (!selectedDb) {
      setLogs([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/sql-logs", { params: { db: selectedDb } });
      // Accept common envelope shapes:
      // [], { data: [] }, { items: [] }, { logs: [] }, { entries: [] }, { result: [] }, { records: [] }, { data: { items: [] } }
      const payload: any = res.data ?? {};
      const arr =
        (Array.isArray(payload) && payload) ||
        (Array.isArray(payload.data) && payload.data) ||
        (Array.isArray(payload.items) && payload.items) ||
        (Array.isArray(payload.logs) && payload.logs) ||
        (Array.isArray(payload.entries) && payload.entries) ||
        (Array.isArray(payload.result) && payload.result) ||
        (Array.isArray(payload.records) && payload.records) ||
        (Array.isArray(payload?.data?.items) && payload.data.items) ||
        [];
      setLogs(arr as SqlLog[]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load SQL logs.";
      setError(String(msg));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }
  async function doUpload() {
    if (!selectedDb || !file) return;
    try {
      setUploading(true);
      setError(null);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("db", selectedDb);
      await fetch("/api/sql-logs/upload", {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: fd,
      }).then(async (res) => {
        if (!res.ok) {
          let msg = "";
          try {
            const j = await res.json();
            msg = j?.error?.message || j?.message || "";
          } catch {}
          throw new Error(msg || "Upload failed");
        }
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
      setSuccessOpen(true);
      await load();
    } catch (e: any) {
      setError(String(e?.message || "Upload failed"));
    } finally {
      setUploading(false);
    }
  }

  async function loadDatabases() {
    setError(null);
    try {
      const res = await client.get("/sql-logs/databases");
      // Expect array of names or { data: [] } or { databases: [] }
      const arr: any =
        (Array.isArray(res.data) && res.data) ||
        (Array.isArray(res.data?.data) && res.data.data) ||
        (Array.isArray(res.data?.databases) && res.data.databases) ||
        [];
      const names = arr.map((x: any) =>
        typeof x === "string" ? x : x?.name ?? x?.db ?? ""
      ).filter((s: string) => s && typeof s === "string");
      setDbs(names);
      // Auto-select first db if none selected
      if (!selectedDb && names.length > 0) {
        setSelectedDb(names[0]);
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load databases.";
      setError(String(msg));
      setDbs([]);
    }
  }

  useEffect(() => {
    loadDatabases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDb) {
      load();
    } else {
      setLogs([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDb]);

  const filtered = useMemo(() => {
    if (!q.trim()) return logs;
    const t = q.trim().toLowerCase();
    return logs.filter((row) => {
      const hay = [
        pick(row, ["sql_query", "sql", "query", "statement", "text"], ""),
        pick(row, ["exec_time_ms", "durationMs", "duration_ms", "elapsed_ms", "time_ms"], ""),
        pick(row, ["exec_count", "count", "rowCount", "rows"], ""),
        pick(row, ["path", "endpoint", "route"], ""),
        pick(row, ["method", "op", "operation"], ""),
        pick(row, ["user", "userId", "username"], ""),
        JSON.stringify(row || {}),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(t);
    });
  }, [logs, q]);

  const columns: Array<Column<SqlLog>> = [
    {
      key: "sql_query",
      header: "SQL Query",
      accessor: (row) => {
        const v = pick(row, ["sql_query", "sql", "query", "statement", "text"], "—");
        return <code className="text-xs">{truncate(v, 120)}</code>;
      },
      className: "max-w-[640px]",
    },
    {
      key: "exec_time_ms",
      header: "Exec Time (ms)",
      accessor: (row) => {
        const ms =
          (pick<number>(row, ["exec_time_ms", "durationMs", "duration_ms", "elapsed_ms", "time_ms"])) ??
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
      <section className="grid gap-4">
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <h1 className="m-0">SQL Logs</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                className="input"
                value={selectedDb}
                onChange={(e) => setSelectedDb(e.target.value)}
                aria-label="Select database"
              >
                <option value="">{dbs.length ? "Select database…" : "Loading databases…"}</option>
                {dbs.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <input
                ref={fileInputRef}
                className="input"
                type="file"
                accept=".log,.txt,.json,application/json,text/plain"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                aria-label="Upload SQL log file"
              />

              <button
                className="btn btn-primary"
                onClick={load}
                disabled={loading || !selectedDb}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                className="btn btn-primary"
                onClick={doUpload}
                disabled={uploading || !selectedDb || !file}
                aria-busy={uploading || undefined}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="alert alert-error mt-3" role="alert">
              {error}
            </div>
          ) : null}

          <div className="mt-4">
            {!selectedDb ? (
              <div className="alert alert-info" role="status">
                Select a database to view SQL logs.
              </div>
            ) : (
              <Table<SqlLog>
                columns={columns}
                data={filtered}
                pagination
                defaultPageSize={10}
                emptyMessage={loading ? "Loading..." : "No logs"}
              />
            )}
          </div>
        </div>
      </section>
      <Modal
        isOpen={successOpen}
        title="Upload successful"
        onClose={() => setSuccessOpen(false)}
        onConfirm={() => setSuccessOpen(false)}
        confirmText="OK"
        cancelText="Close"
      >
        <p className="m-0">Your log file has been uploaded successfully.</p>
      </Modal>
    </Layout>
  );
}
