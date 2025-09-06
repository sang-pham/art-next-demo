"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "../../lib/auth/authProvider";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const itemBase =
  "flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-gray-100 hover:text-slate-900 transition-colors no-underline";

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed z-50 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm",
          "transform transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "sm:static sm:translate-x-0 sm:shadow-none sm:w-60",
          "flex flex-col",
        ].join(" ")}
        aria-label="Sidebar navigation"
      >
        <div className="hidden sm:block h-14 border-b border-gray-200" />
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <nav>
            <ul className="m-0 p-0 list-none space-y-1">
              <li>
                <Link href="/" className={itemBase} onClick={onClose}>
                  <span className="i-ph-house-simple-duotone" aria-hidden />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className={itemBase} onClick={onClose}>
                  <span className="i-ph-gear-duotone" aria-hidden />
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <Link href="/profile" className={itemBase} onClick={onClose}>
                  <span className="i-ph-user-circle-duotone" aria-hidden />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className={itemBase} onClick={onClose}>
                  <span className="i-ph-shield-check-duotone" aria-hidden />
                  <span>Admin</span>
                </Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <button
                    className={[itemBase, "w-full text-left"].join(" ")}
                    onClick={async () => {
                      await logout();
                      onClose();
                    }}
                  >
                    <span className="i-ph-sign-out-duotone" aria-hidden />
                    <span>Logout</span>
                  </button>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>
        <div className="border-t border-gray-200 p-3 text-xs text-slate-500">
          <p className="m-0">v0.1.0</p>
        </div>
      </aside>
    </>
  );
}