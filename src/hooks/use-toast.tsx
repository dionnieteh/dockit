// src/hooks/use-toast.tsx (or .ts if you prefer)
"use client"

import * as React from "react"

// Define the type for a single toast
type Toast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode // For a button or other interactive element in the toast
  duration?: number // How long the toast should display in ms
  variant?: "default" | "destructive" // To allow different styling for toasts
  // Add other properties if your Toast component supports them (e.g., icon, status)
}

// Define the type for the context value
type ToastContextType = {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => { id: string } // Function to add a toast, returns its ID
  dismiss: (id: string) => void // Function to dismiss a specific toast
}

// Create the context
const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

// Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  // Function to add a new toast
  const toast = React.useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9); // Simple unique ID
    const newToast: Toast = { id, ...props };
    setToasts(prevToasts => [...prevToasts, newToast]);

    // Auto-dismiss the toast after a duration if provided
    if (props.duration && props.duration > 0) {
      setTimeout(() => {
        setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
      }, props.duration);
    }
    return { id }; // Return the ID for potential programmatic dismissal
  }, []);

  // Function to dismiss a specific toast
  const dismiss = React.useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Effect to clean up toasts if they were manually closed or for other reasons
  React.useEffect(() => {
    // You might want more sophisticated cleanup here if toasts can be dismissed externally
    // For now, the auto-dismiss in `toast` and `ToastClose` in Toaster handles most cases.
  }, [toasts]);


  const value = React.useMemo(() => ({
    toasts,
    toast,
    dismiss,
  }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

// Custom hook to consume the toast context
export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}