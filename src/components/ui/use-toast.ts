"use client";

import { useCallback } from "react";

type ToastVariant = "default" | "destructive";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    if (typeof window !== "undefined") {
      const { title, description, variant } = options;
      const prefix = variant === "destructive" ? "[error]" : "[toast]";
      const message = [prefix, title, description].filter(Boolean).join(" ");

      // In production, replace with proper toast notification system
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper toast notification library (e.g., react-hot-toast, sonner, etc.)
        // showToast({ title, description, variant });
      } else {
        console.log(message);
      }
    }
  }, []);

  return { toast };
}
