/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "info" | "success" | "error";
type Toast = { id: string; type: ToastType; message: string; durationMs?: number };

const ToastCtx = createContext<{
  show: (message: string, type?: ToastType, durationMs?: number) => void;
} | null>(null);

function genId() {
  return Math.random().toString(36).slice(2);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, any>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tm = timers.current[id];
    if (tm) {
      clearTimeout(tm);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback((message: string, type: ToastType = "info", durationMs = 3000) => {
    const id = genId();
    setToasts((prev) => [...prev, { id, type, message, durationMs }]);
    timers.current[id] = setTimeout(() => remove(id), durationMs);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed z-[9999] bottom-4 right-4 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={[
              "rounded-md shadow px-3 py-2 text-sm text-white",
              t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-rose-600" : "bg-slate-800"
            ].join(" ")}
            onClick={() => remove(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

