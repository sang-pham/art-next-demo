"use client";

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { ToastProvider } from "components/feedback/ToastProvider";


export interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen((v) => !v);
  }, []);

  const closeSidebar = React.useCallback(() => setSidebarOpen(false), []);

  return (
    <ToastProvider>
      <div className="min-h-screen grid grid-rows-[auto_1fr_auto] app-bg">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="relative">
          <div className="sm:flex">
            <main className="flex-1 px-4 py-6 mx-auto max-w-6xl w-full">
              {children}
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </ToastProvider>
  );
}