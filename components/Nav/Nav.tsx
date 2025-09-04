"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Nav.module.css";
import { useAuth } from "../../lib/auth/authProvider";

export default function Nav() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/">art-next-demo</Link>
        </div>
        <nav aria-label="Main navigation">
          <ul className={styles.nav}>
            <li>
              <Link className={styles.link} href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/about">
                About
              </Link>
            </li>
            {!isAuthenticated ? (
              <>
                <li>
                  <Link className={styles.link} href="/register">
                    Register
                  </Link>
                </li>
                <li>
                  <Link className={styles.link} href="/login">
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link className={styles.link} href="/profile">
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    className={styles.link}
                    onClick={async () => {
                      await logout();
                      router.push("/login");
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
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
