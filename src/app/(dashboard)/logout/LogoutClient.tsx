"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, CheckCircle } from "lucide-react";

export function LogoutClient() {
  useEffect(() => {
    // In a real app, this would clear auth tokens, session data, etc.
    // For now, just simulate the logout process
    console.log("Logout process initiated");
  }, []);

  const handleConfirmLogout = () => {
    // In a real app, this would:
    // 1. Clear authentication tokens
    // 2. Clear local storage/session storage
    // 3. Redirect to login page
    // 4. Invalidate server session
    alert("Logout functionality would be implemented here");
  };

  const handleCancel = () => {
    // Navigate back to dashboard
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <LogOut className="h-6 w-6 text-rose-600" />
          </div>
          <CardTitle>Confirm Logout</CardTitle>
          <CardDescription>
            Are you sure you want to sign out of Nasara Connect?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Your work has been automatically saved
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              All compliance data is securely stored
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              You can sign back in anytime
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
              className="flex-1"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Signed in as <strong>regina.miles@nasara.co</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}