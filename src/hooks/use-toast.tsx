// src/hooks/use-toast.tsx
"use client";

import * as React from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  variant?: ToastVariant;
};

enum ToastVariant {
  ERROR = "error",
  SUCCESS = "success",
  DEFAULT = "default",
}

type ToastContextType = {
  toasts: Toast[];
  toast: (props: Omit<Toast, "id">) => { id: string };
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const toast = React.useCallback((props: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    let emoji = "";
    switch (props.variant) {
      case "error":
        emoji = "❌ ";
        break;
      case "success":
        emoji = "✅ ";
        break;
      default:
        emoji = "";
    }

    const newToast: Toast = {
      id,
      duration: 5000,
      ...props,
      title: emoji + (props.title ? props.title : "Notification"),
    }; setToasts((prev) => [...prev, newToast]);

    if (typeof window !== "undefined") {
      try {
        const ding = new Audio("/ding.mp3");
        ding.play();
      } catch (e) {
        console.warn("Failed to play ding sound", e);
      }
    }

    if (newToast.duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }

    return { id };
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {isClient ? children : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export { ToastVariant };