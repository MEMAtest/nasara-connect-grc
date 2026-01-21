"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProgressContextType {
  isLoading: boolean;
  progress: number;
  start: () => void;
  done: () => void;
  set: (value: number) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ref to track completion timeout for cleanup
  const completionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Start progress bar
  const start = useCallback(() => {
    // Clear any pending completion timeout
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
    setIsLoading(true);
    setProgress(0);
  }, []);

  // Complete progress bar
  const done = useCallback(() => {
    setProgress(100);
    // Small delay before hiding to show completion
    completionTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      completionTimeoutRef.current = null;
    }, 200);
  }, []);

  // Set specific progress value
  const set = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  // Track route changes
  useEffect(() => {
    // Mark loading as complete when route changes finish
    if (isLoading) {
      done();
    }
  }, [pathname, searchParams, isLoading, done]);

  // Animate progress while loading
  useEffect(() => {
    if (!isLoading) return;

    // Start with initial progress
    setProgress(10);

    // Gradually increase progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Slow down as we approach 90%
        const increment = Math.max(1, (90 - prev) / 10);
        return Math.min(90, prev + increment);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <ProgressContext.Provider value={{ isLoading, progress, start, done, set }}>
      {children}
      <NavigationProgressBar isLoading={isLoading} progress={progress} />
    </ProgressContext.Provider>
  );
}

function NavigationProgressBar({
  isLoading,
  progress,
}: {
  isLoading: boolean;
  progress: number;
}) {
  if (!isLoading && progress === 0) return null;

  return (
    <div
      className={cn(
        "fixed left-0 right-0 top-0 z-[9999] h-1 overflow-hidden bg-transparent",
        "transition-opacity duration-200",
        isLoading || progress > 0 ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "h-full bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500",
          "transition-transform duration-200 ease-out",
          progress < 100 && "animate-pulse"
        )}
        style={{
          transform: `translateX(-${100 - progress}%)`,
          boxShadow: "0 0 10px rgba(20, 184, 166, 0.5)",
        }}
      />
    </div>
  );
}

/**
 * Hook to access the progress bar
 */
export function useProgressBar() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgressBar must be used within a ProgressProvider");
  }
  return context;
}

/**
 * Wrapper for fetch that triggers progress bar
 */
export function createProgressFetch(progressBar: ProgressContextType) {
  return async function progressFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    progressBar.start();
    try {
      const response = await fetch(input, init);
      return response;
    } finally {
      progressBar.done();
    }
  };
}
