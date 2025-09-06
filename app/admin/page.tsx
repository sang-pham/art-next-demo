"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../lib/auth/authProvider";
import { getAccessToken } from "../../lib/auth/tokenStore";

type Role = "Admin" | "User";
type Status = "Active" | "Inactive" | "Blocked" | "Pending" | string;

type AdminUser = {
  id: string | number;
  username?: string;
  email?: string;
  name?: string;
  role?: Role | string;
  status?: Status;
  active?: boolean;
  [k: string]: any;
};

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || "http://localhost:8081";

function useAuthHeader() {
  const { accessToken } = useAuth();
  const token = accessToken || getAccessToken();
  return useMemo(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
    } as Record<string, string>;
  }, [token]);
}

export default function AdminPage() {
  const headers = useAuthHeader();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [cEmail, setCEmail] = useState("");
  const [cUsername, setCUsername] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const authorized = "Authorization" in headers;

  const loadUsers = useCallback(async () => {
    if (!authorized) {
      setError("Not authenticated or not authorized.");
      setUsers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/v1/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include",
      });
      if (!res.ok) {
        let body: any = {};
        try {
          body = await res.json();
        } catch {}
        const msg =
          body?.error?.message ||
          body?.message ||
          (res.status === 403
            ? "Forbidden (admin only)."
            : "Failed to load users.");
        throw new Error(msg);
      }
      const data = await res.json();
      // Attempt to unwrap models from various envelope shapes
      const list: AdminUser[] =
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data?.users) && data.users) ||
        [];
      setUsers(list);
    } catch (e: any) {
      setError(String(e?.message || "Failed to load users."));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authorized, headers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!authorized) return;
    setCreating(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        username: cUsername || undefined,
        email: cEmail,
        password: cPassword,
      };
      const res = await fetch(`${BACKEND}/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let body: any = {};
        try {
          body = await res.json();
        } catch {}
        const msg =
          body?.error?.message ||
          body?.message ||
          (res.status === 409
            ? "User already exists."
            : "Failed to create user.");
        throw new Error(msg);
      }
      setCEmail("");
      setCUsername("");
      setCPassword("");
      await loadUsers();
    } catch (e: any) {
      setError(String(e?.message || "Failed to create user."));
    } finally {
      setCreating(false);
    }
  }

  async function deleteUser(id: string | number) {
    if (!authorized) return;
    if (!confirm("Delete this user?")) return;
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include",
      });
      if (!res.ok) {
        let body: any = {};
        try {
          body = await res.json();
        } catch {}
        const msg =
          body?.error?.message || body?.message || "Failed to delete user.";
        throw new Error(msg);
      }
      await loadUsers();
    } catch (e: any) {
      setError(String(e?.message || "Failed to delete user."));
    }
  }

  async function updateRole(id: string | number) {
    if (!authorized) return;
    const input = prompt('Enter new role (e.g. "Admin" or "User"):');
    if (!input) return;
    const role = input.trim();
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/v1/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include",
        // Some backends expect { role }, others { newRole }
        body: JSON.stringify({ role, newRole: role }),
      });
      if (!res.ok) {
        let body: any = {};
        try {
          body = await res.json();
        } catch {}
        const msg =
          body?.error?.message || body?.message || "Failed to update role.";
        throw new Error(msg);
      }
      await loadUsers();
    } catch (e: any) {
      setError(String(e?.message || "Failed to update role."));
    }
  }

  async function toggleStatus(id: string | number, current: AdminUser) {
    if (!authorized) return;
    // Try to infer next state
    const isActive =
      typeof current.active === "boolean"
        ? current.active
        : String(current.status || "").toLowerCase() === "active";
    const nextActive = !isActive;

    setError(null);
    try {
      const res = await fetch(`${BACKEND}/v1/admin/users/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include",
        // Try common shapes
        body: JSON.stringify({
          active: nextActive,
          status: nextActive ? "Active" : "Inactive",
          enabled: nextActive,
        }),
      });
      if (!res.ok) {
        let body: any = {};
        try {
          body = await res.json();
        } catch {}
        const msg =
          body?.error?.message ||
          body?.message ||
          "Failed to update status.";
        throw new Error(msg);
      }
      await loadUsers();
    } catch (e: any) {
      setError(String(e?.message || "Failed to update status."));
    }
  }

  return (
    <Layout>
      <section className="grid gap-6">
        <div className="card">
          <h1>Admin - Users</h1>

          {!authorized ? (
            <div className="alert alert-error mt-3" role="alert">
              Not authenticated.
            </div>
          ) : null}

          {error ? (
            <div className="alert alert-error mt-3" role="alert">
              {error}
            </div>
          ) : null}

          <div className="mt-4">
            <form className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={createUser}>
              <input
                className="input"
                placeholder="username"
                value={cUsername}
                onChange={(e) => setCUsername(e.target.value)}
                autoComplete="off"
              />
              <input
                className="input"
                placeholder="email"
                type="email"
                required
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                autoComplete="off"
              />
              <input
                className="input"
                placeholder="password"
                type="password"
                required
                value={cPassword}
                onChange={(e) => setCPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!authorized || creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </form>
          </div>

          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <p className="muted">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="muted">No users found.</p>
            ) : (
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border-b">ID</th>
                    <th className="text-left p-2 border-b">Username</th>
                    <th className="text-left p-2 border-b">Email</th>
                    <th className="text-left p-2 border-b">Name</th>
                    <th className="text-left p-2 border-b">Role</th>
                    <th className="text-left p-2 border-b">Status</th>
                    <th className="text-left p-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isActive =
                      typeof u.active === "boolean"
                        ? u.active
                        : String(u.status || "").toLowerCase() === "active";
                    return (
                      <tr key={String(u.id)} className="odd:bg-white even:bg-gray-50">
                        <td className="p-2 border-b">{String(u.id)}</td>
                        <td className="p-2 border-b">{u.username ?? "—"}</td>
                        <td className="p-2 border-b">{u.email ?? "—"}</td>
                        <td className="p-2 border-b">{u.name ?? "—"}</td>
                        <td className="p-2 border-b">{u.role ?? "—"}</td>
                        <td className="p-2 border-b">
                          {isActive ? "Active" : u.status ?? "Inactive"}
                        </td>
                        <td className="p-2 border-b">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-ghost"
                              onClick={() => updateRole(u.id)}
                              disabled={!authorized}
                              title="Update Role"
                            >
                              Role
                            </button>
                            <button
                              className="btn btn-ghost"
                              onClick={() => toggleStatus(u.id, u)}
                              disabled={!authorized}
                              title="Toggle Active/Inactive"
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => deleteUser(u.id)}
                              disabled={!authorized}
                              title="Delete User"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}