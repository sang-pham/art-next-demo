"use client";

import React from "react";

export default function Footer() {
  // Use UTC year to avoid SSR/CSR timezone differences causing hydration mismatch.
  const year = new Date().getUTCFullYear();
  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-md text-white">
        <p className="m-0 text-white">&copy; <span suppressHydrationWarning>{year}</span> ART TEAM. All rights reserved.</p>
       
      </div>
    </footer>
  );
}