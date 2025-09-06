"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../lib/auth/authProvider";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const linkClass = (href: string) =>
    `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-white no-underline border border-transparent transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:outline-offset-2 ${pathname === href
      ? "bg-blue-500/20 border-blue-400/50 text-white"
      : ""
    }`;

  const ariaCurrent = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-700 bg-slate-900/95 backdrop-blur-sm backdrop-saturate-150">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="font-bold tracking-tight">
          <Link href="/" className="text-white no-underline">
           
          </Link>
        </div>
        <nav aria-label="Main navigation">
          <ul className="flex gap-2 items-center list-none m-0 p-0 flex-wrap">
            <li>
              <Link className={linkClass("/")} aria-current={ariaCurrent("/")} href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className={linkClass("/about")} aria-current={ariaCurrent("/about")} href="/about">
                About
              </Link>
            </li>
            {!isAuthenticated ? (
              <>
                <li>
                  <Link
                    className={linkClass("/register")}
                    aria-current={ariaCurrent("/register")}
                    href="/register"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link className={linkClass("/login")} aria-current={ariaCurrent("/login")} href="/login">
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    className={linkClass("/profile")}
                    aria-current={ariaCurrent("/profile")}
                    href="/profile"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    className={`bg-transparent border-none p-0 m-0 font-inherit text-inherit cursor-pointer ${linkClass("/logout")}`}
                    onClick={async () => {
                      await logout();
                      router.push("/login");
                      router.refresh();
                    }}
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
