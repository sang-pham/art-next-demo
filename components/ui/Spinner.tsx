"use client";

import React from "react";

export type SpinnerSize = "sm" | "md" | "lg";
export interface SpinnerProps extends React.HTMLAttributes<SVGElement> {
  size?: SpinnerSize;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <svg
      className={["animate-spin text-current", sizeMap[size], className].filter(Boolean).join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      role="progressbar"
      aria-label="Loading"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
  );
}