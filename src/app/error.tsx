"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-slate-900">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while loading this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV !== 'production' && (
            <div className="p-3 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600 font-mono break-all">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={reset}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>

            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}