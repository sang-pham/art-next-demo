"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...props },
  ref
) {
  const inputId = id || React.useId();

  return (
    <div className="grid gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-900">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        suppressHydrationWarning
        className={[
          "w-full px-3 py-2.5 border rounded-md bg-white text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          className || "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={!!error || undefined}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;