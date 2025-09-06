"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "../../lib/auth/authProvider";
import Button from "../ui/Button";
import { usePathname } from "next/navigation";

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `text-slate-700 hover:text-slate-900 no-underline ${pathname === href ? "font-bold" : ""}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex sm:hidden items-center justify-center h-9 w-9 rounded-md border border-gray-300 hover:bg-gray-50"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h12M4 18h8" />
            </svg>
          </button>

          <Link href="/" className="inline-flex items-center gap-2 no-underline select-none">
            <img src="/assets/logo.png" alt="Logo" className="h-15 w-15" />
            <span className="font-bold text-slate-900 text-xl xl:text-base">ART</span>
          </Link>
        </div>

        <nav className="hidden sm:block">
          <ul className="flex items-center gap-4 list-none m-0 p-0">
            <li>
              <Link
                className={linkClass("/")}
                aria-current={pathname === "/" ? "page" : undefined}
                href="/"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className={linkClass("/about")}
                aria-current={pathname === "/about" ? "page" : undefined}
                href="/about"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className={linkClass("/profile")}
                aria-current={pathname === "/profile" ? "page" : undefined}
                href="/profile"
              >
                Profile
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
                onClick={async () => { await logout(); }}
                className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-gray-300 bg-white text-slate-900 hover:bg-gray-50"
              >
                Logout
              </button>
        </div>
      </div>
    </header>
  );
}