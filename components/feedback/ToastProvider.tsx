"use client";

import React from "react";
import Toast, { type ToastVariant } from "./Toast";

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  show: (t: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = React.useCallback(() => setToasts([]), []);

  const show = React.useCallback(
    ({ title, description, variant = "info", duration = 3500 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const item: ToastItem = { id, title, description, variant, duration };
      setToasts((prev) => [item, ...prev]);

      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = React.useMemo<ToastContextValue>(
    () => ({ show, dismiss, clear }),
    [show, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Region for toasts */}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed top-16 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            title={t.title}
            description={t.description}
            variant={t.variant}
            onClose={() => dismiss(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (ctx) return ctx;
  // Fallback no-op implementation to avoid runtime crashes if a component
  // calls useToast outside of <ToastProvider>. This preserves UX and logs a warning.
  return {
    show: ({ title, description, variant, duration }: any) => {
      if (typeof window !== "undefined" && (console as any)?.warn) {
        try {
          console.warn(
            "useToast called outside ToastProvider; showing no-op toast:",
            { title, description, variant, duration }
          );
        } catch {}
      }
      return "";
    },
    dismiss: () => {},
    clear: () => {},
  };
}