"use client";

import React from "react";
import Button, { type ButtonProps } from "../ui/Button";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    props?: Omit<ButtonProps, "children">;
  };
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({
  title,
  description,
  action,
  headerExtra,
  footer,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={[
        "bg-white border border-gray-200 rounded-xl shadow-sm",
        "p-4 sm:p-5",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {(title || description || headerExtra || action) && (
        <header className="flex flex-col sm:flex-row gap-2 sm:items-start sm:justify-between">
          <div>
            {title ? (
              <h3 className="m-0 text-lg font-semibold text-slate-900">{title}</h3>
            ) : null}
            {description ? (
              <p className="m-0 mt-1 text-slate-600">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {headerExtra}
            {action ? (
              <Button onClick={action.onClick} {...(action.props || {})}>
                {action.label}
              </Button>
            ) : null}
          </div>
        </header>
      )}

      <div className={(title || description || headerExtra || action) ? "mt-4" : ""}>
        {children}
      </div>

      {footer ? <footer className="mt-4 pt-4 border-t border-gray-100">{footer}</footer> : null}
    </section>
  );
}