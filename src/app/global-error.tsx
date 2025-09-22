"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Global application error:', error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-50 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-slate-900">Critical Error</CardTitle>
              <CardDescription>
                A critical error occurred that affected the entire application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV !== 'production' && (
                <div className="p-3 bg-slate-100 rounded-lg">
                  <p className="text-sm text-slate-600 font-mono break-all">
                    {error.message || 'Unknown critical error'}
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
                  Restart application
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Reload page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}