"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastFn = (message: string) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<number>(0);

  const toast = useCallback<ToastFn>((m) => {
    setMessage(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(""), 2600);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {message && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[70] max-w-[calc(100%-32px)] -translate-x-1/2 rounded-md bg-fg px-4 py-2.5 text-[13px] font-medium text-bg"
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastFn {
  return useContext(ToastContext);
}
