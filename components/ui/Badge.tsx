"use client";

import React from "react";

type Variant = "default" | "success" | "warning" | "error" | "info";
type Size = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-900 border border-slate-200",
  success: "bg-green-100 text-green-800 border border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  error: "bg-red-100 text-red-800 border border-red-200",
  info: "bg-blue-100 text-blue-800 border border-blue-200",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
};

export default function Badge({
  className,
  variant = "default",
  size = "sm",
  pill = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-medium",
        "align-middle select-none",
        "whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        pill ? "rounded-full" : "rounded-md",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}