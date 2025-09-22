"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function NotFoundClient() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <FileQuestion className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-slate-900">Page Not Found</CardTitle>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Link href="/" className="block">
              <Button className="w-full" variant="default">
                <Home className="mr-2 h-4 w-4" />
                Go to dashboard
              </Button>
            </Link>

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </div>

          <div className="text-center text-sm text-slate-500">
            <p>Error code: 404</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}