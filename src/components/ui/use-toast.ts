"use client";

import { useCallback } from "react";
import { useToast as useToastProvider } from "@/components/toast-provider";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toastApi = useToastProvider();

  const toast = useCallback(
    (options: ToastOptions) => {
      const { title, description, variant } = options;
      const message = [title, description].filter(Boolean).join(" • ");
      if (!message) return;
      const type =
        variant === "destructive"
          ? "error"
          : variant === "success"
            ? "success"
            : variant === "warning"
              ? "warning"
              : "info";
      toastApi.addToast(message, type);
    },
    [toastApi],
  );

  return { toast };
}
