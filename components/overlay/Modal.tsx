"use client";

import React from "react";
import Button from "../ui/Button";

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  disableConfirm?: boolean;
  footer?: React.ReactNode; // custom footer overrides default OK/Cancel
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  disableConfirm = false,
  footer,
}: ModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        aria-hidden
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="relative z-10 mx-4 w-full max-w-lg rounded-lg bg-white shadow-lg border border-gray-200"
      >
        {title ? (
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 id="modal-title" className="m-0 text-lg font-semibold text-slate-900">
              {title}
            </h3>
          </div>
        ) : null}

        <div className="px-4 py-4">{children}</div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
          {footer ? (
            footer
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>{cancelText}</Button>
              {onConfirm ? (
                <Button onClick={onConfirm} disabled={disableConfirm}>{confirmText}</Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}