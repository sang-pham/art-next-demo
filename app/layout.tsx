import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Nav from "../components/Nav/Nav";
import { AuthProvider } from "../lib/auth/authProvider";

export const metadata: Metadata = {
  title: "art-next-demo",
  description: "Minimal Next.js 15 base project",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
