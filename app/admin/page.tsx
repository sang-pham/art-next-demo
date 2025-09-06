"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../lib/auth/authProvider";
import { createBrowserClient } from "../../lib/http/client";
import Modal from "../../components/overlay/Modal";

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

export default function AdminPage() {
  const { isAuthenticated } = useAuth();
  const client = useMemo(() => createBrowserClient(), []);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [cEmail, setCEmail] = useState("");
  const [cUsername, setCUsername] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [creating, setCreating] = useState(false);
  // Role dialog state
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [roleValue, setRoleValue] = useState("");

  const authorized = isAuthenticated;

  const extractList = (data: any): AdminUser[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.users)) return data.users;
    return [];
    };

  const loadUsers = useCallback(async () => {
    if (!authorized) {
      setError("Not authenticated or not authorized.");
      setUsers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/admin/users");
      const list = extractList(res.data);
      setUsers(list);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        (status === 403 ? "Forbidden (admin only)." : "Failed to load users.");
      setError(String(msg));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authorized, client]);

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
      await client.post("/admin/users", payload);
      setCEmail("");
      setCUsername("");
      setCPassword("");
      await loadUsers();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        (status === 409 ? "User already exists." : "Failed to create user.");
      setError(String(msg));
    } finally {
      setCreating(false);
    }
  }

  async function deleteUser(id: string | number) {
    if (!authorized) return;
    if (!confirm("Delete this user?")) return;
    setError(null);
    try {
      await client.delete(`/admin/users/${id}`);
      await loadUsers();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        "Failed to delete user.";
      setError(String(msg));
    }
  }

  function openRoleDialog(user: AdminUser) {
    if (!authorized) return;
    setRoleTarget(user);
    setRoleValue(String(user.role ?? ""));
    setRoleOpen(true);
  }

  function closeRoleDialog() {
    setRoleOpen(false);
  }

  async function confirmRoleDialog() {
    if (!authorized || !roleTarget) return;
    const role = roleValue.trim();
    if (!role) return;
    setError(null);
    try {
      await client.put(`/admin/users/${roleTarget.id}/role`, { role, newRole: role });
      setRoleOpen(false);
      setRoleTarget(null);
      await loadUsers();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        "Failed to update role.";
      setError(String(msg));
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
      await client.put(`/admin/users/${id}/status`, {
        active: nextActive,
        status: nextActive ? "Active" : "Inactive",
        enabled: nextActive,
      });
      await loadUsers();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        "Failed to update status.";
      setError(String(msg));
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
                    {/* <th className="text-left p-2 border-b">Name</th> */}
                    <th className="text-left p-2 border-b">Role</th>
                    {/* <th className="text-left p-2 border-b">Status</th> */}
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
                        {/* <td className="p-2 border-b">{u.name ?? "—"}</td> */}
                        <td className="p-2 border-b">{u.role ?? "—"}</td>
                        {/* <td className="p-2 border-b">
                          {isActive ? "Active" : u.status ?? "Inactive"}
                        </td> */}
                        <td className="p-2 border-b">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-primary text-white"
                              onClick={() => openRoleDialog(u)}
                              disabled={!authorized}
                              title="Update Role"
                            >
                              Role
                            </button>
                            {/* <button
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
                            </button> */}
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
          <Modal
            isOpen={roleOpen}
            title="Update role"
            onClose={closeRoleDialog}
            onConfirm={confirmRoleDialog}
            confirmText="Save"
            disableConfirm={!roleValue.trim()}
          >
            <div className="grid gap-2">
              <label className="label" htmlFor="role-input">New role</label>
              <input
                id="role-input"
                className="input"
                placeholder="Admin or User"
                value={roleValue}
                onChange={(e) => setRoleValue(e.target.value)}
                autoComplete="off"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setRoleValue("Admin")}
                >
                  Admin
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setRoleValue("User")}
                >
                  User
                </button>
              </div>
            </div>
          </Modal>
    </Layout>
  );
}